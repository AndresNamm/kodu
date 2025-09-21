import React, { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Matrix } from 'ml-matrix';

interface Point {
  coords: [number, number, number];
  color: string;
}

interface Points {
  [key: string]: Point;
}

interface StoredMatrix {
  timestamp: string;
  matrix: number[][];
  camera_pos: [number, number, number];
  rotation: [number, number, number];
}

const PointVisualization3D: React.FC = () => {
  // Initial points data
  const initialPoints: Points = {
    "Point 1": { coords: [1, 2, 3], color: "red" },
    "Point 2": { coords: [4, 1, 2], color: "blue" },
    "Point 3": { coords: [2, 5, 1], color: "green" },
    "Point 4": { coords: [3, 3, 4], color: "orange" }
  };

  // State for points
  const [points, setPoints] = useState<Points>(initialPoints);
  
  // Camera state
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0, z: 0 });
  const [cameraRot, setCameraRot] = useState({ x: 0, y: 0, z: 0 });
  
  // Stored matrices state
  const [storedMatrices, setStoredMatrices] = useState<StoredMatrix[]>([]);

  // Function to create rotation matrix from Euler angles
  const eulerToRotationMatrix = (rx: number, ry: number, rz: number): number[][] => {
    const rxRad = (rx * Math.PI) / 180;
    const ryRad = (ry * Math.PI) / 180;
    const rzRad = (rz * Math.PI) / 180;

    // Rotation matrices for each axis
    const Rx = [
      [1, 0, 0],
      [0, Math.cos(rxRad), -Math.sin(rxRad)],
      [0, Math.sin(rxRad), Math.cos(rxRad)]
    ];

    const Ry = [
      [Math.cos(ryRad), 0, Math.sin(ryRad)],
      [0, 1, 0],
      [-Math.sin(ryRad), 0, Math.cos(ryRad)]
    ];

    const Rz = [
      [Math.cos(rzRad), -Math.sin(rzRad), 0],
      [Math.sin(rzRad), Math.cos(rzRad), 0],
      [0, 0, 1]
    ];

    // Combined rotation matrix (ZYX order)
    const RzMatrix = new Matrix(Rz);
    const RyMatrix = new Matrix(Ry);
    const RxMatrix = new Matrix(Rx);
    
    const R = RzMatrix.mmul(RyMatrix).mmul(RxMatrix);
    return R.to2DArray();
  };

  // Compute rotation matrix and extrinsic matrix
  const rotationMatrix = useMemo(() => 
    eulerToRotationMatrix(cameraRot.x, cameraRot.y, cameraRot.z), 
    [cameraRot]
  );

  const extrinsicMatrix = useMemo(() => {
    const R = rotationMatrix;
    const t = [[cameraPos.x], [cameraPos.y], [cameraPos.z]];
    return R.map((row, i) => [...row, t[i][0]]);
  }, [rotationMatrix, cameraPos]);

  // Transform world coordinates to camera coordinates
  const transformToCameraCoords = (worldPoint: [number, number, number]): [number, number, number] => {
    const cameraPosition = [cameraPos.x, cameraPos.y, cameraPos.z];
    const relativePos = worldPoint.map((coord, i) => coord - cameraPosition[i]);
    
    const R = new Matrix(rotationMatrix);
    const relativePosMatrix = new Matrix([relativePos]).transpose();
    const cameraCoords = R.mmul(relativePosMatrix);
    
    return [cameraCoords.get(0, 0), cameraCoords.get(1, 0), cameraCoords.get(2, 0)];
  };

  // Generate plot data
  const plotData = useMemo(() => {
    const traces: any[] = [];

    // Add points
    Object.entries(points).forEach(([name, point]) => {
      const [x, y, z] = point.coords;
      traces.push({
        x: [x],
        y: [y],
        z: [z],
        mode: 'markers',
        marker: {
          size: 10,
          color: point.color,
          opacity: 0.8
        },
        type: 'scatter3d',
        name: name,
        text: `${name}<br>(${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`,
        hovertemplate: "%{text}<extra></extra>"
      });
    });

    // Add camera position
    traces.push({
      x: [cameraPos.x],
      y: [cameraPos.y],
      z: [cameraPos.z],
      mode: 'markers',
      marker: {
        size: 15,
        color: 'black',
        symbol: 'diamond',
        opacity: 1.0
      },
      type: 'scatter3d',
      name: 'Camera',
      text: `Camera<br>(${cameraPos.x.toFixed(1)}, ${cameraPos.y.toFixed(1)}, ${cameraPos.z.toFixed(1)})`,
      hovertemplate: "%{text}<extra></extra>"
    });

    // Add camera coordinate axes
    const axisLength = 2.0;
    const cameraAxes = [
      [axisLength, 0, 0],  // X-axis (red)
      [0, axisLength, 0],  // Y-axis (green)
      [0, 0, axisLength]   // Z-axis (blue)
    ];

    const R = new Matrix(rotationMatrix);
    const colors = ['red', 'green', 'blue'];
    const axisNames = ['X-axis', 'Y-axis', 'Z-axis'];

    cameraAxes.forEach((axis, i) => {
      const axisMatrix = new Matrix([axis]).transpose();
      const rotatedAxis = R.mmul(axisMatrix);
      const [rx, ry, rz] = [rotatedAxis.get(0, 0), rotatedAxis.get(1, 0), rotatedAxis.get(2, 0)];

      traces.push({
        x: [cameraPos.x, cameraPos.x + rx],
        y: [cameraPos.y, cameraPos.y + ry],
        z: [cameraPos.z, cameraPos.z + rz],
        mode: 'lines',
        line: {
          color: colors[i],
          width: 5
        },
        type: 'scatter3d',
        name: `Cam ${axisNames[i]}`,
        showlegend: false
      });
    });

    return traces;
  }, [points, cameraPos, rotationMatrix]);

  // Store current matrix
  const storeMatrix = () => {
    const matrixEntry: StoredMatrix = {
      timestamp: `Matrix ${storedMatrices.length + 1}`,
      matrix: extrinsicMatrix.map(row => [...row]),
      camera_pos: [cameraPos.x, cameraPos.y, cameraPos.z],
      rotation: [cameraRot.x, cameraRot.y, cameraRot.z]
    };
    setStoredMatrices([...storedMatrices, matrixEntry]);
  };

  // Clear stored matrices
  const clearMatrices = () => {
    setStoredMatrices([]);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '300px', 
        backgroundColor: '#f0f2f6', 
        padding: '20px', 
        overflowY: 'auto',
        borderRight: '1px solid #e0e0e0'
      }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Point Controls</h3>
        
        {Object.entries(points).map(([name, point]) => (
          <div key={name} style={{ marginBottom: '20px', padding: '10px', backgroundColor: 'white', borderRadius: '5px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: point.color }}>{name}</h4>
            {['X', 'Y', 'Z'].map((axis, i) => (
              <div key={axis} style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', marginBottom: '2px', fontSize: '12px' }}>
                  {axis}: {point.coords[i].toFixed(1)}
                </label>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.1"
                  value={point.coords[i]}
                  onChange={(e) => {
                    const newCoords = [...point.coords] as [number, number, number];
                    newCoords[i] = parseFloat(e.target.value);
                    setPoints({
                      ...points,
                      [name]: { ...point, coords: newCoords }
                    });
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            ))}
          </div>
        ))}

        <h3 style={{ color: '#333' }}>Camera Extrinsic Matrix</h3>
        <p style={{ fontSize: '14px', color: '#666' }}>Camera position and orientation</p>
        
        {/* Camera position controls */}
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: 'white', borderRadius: '5px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Camera Position</h4>
          {[
            { key: 'x', label: 'Camera X' },
            { key: 'y', label: 'Camera Y' },
            { key: 'z', label: 'Camera Z' }
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', marginBottom: '2px', fontSize: '12px' }}>
                {label}: {cameraPos[key as keyof typeof cameraPos].toFixed(1)}
              </label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={cameraPos[key as keyof typeof cameraPos]}
                onChange={(e) => setCameraPos({
                  ...cameraPos,
                  [key]: parseFloat(e.target.value)
                })}
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>

        {/* Camera rotation controls */}
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: 'white', borderRadius: '5px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Camera Rotation</h4>
          {[
            { key: 'x', label: 'Rotation X (deg) - Red axis' },
            { key: 'y', label: 'Rotation Y (deg) - Green axis' },
            { key: 'z', label: 'Rotation Z (deg) - Blue axis' }
          ].map(({ key, label }) => (
            <div key={key} style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', marginBottom: '2px', fontSize: '12px' }}>
                {label}: {cameraRot[key as keyof typeof cameraRot].toFixed(0)}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={cameraRot[key as keyof typeof cameraRot]}
                onChange={(e) => setCameraRot({
                  ...cameraRot,
                  [key]: parseFloat(e.target.value)
                })}
                style={{ width: '100%' }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={storeMatrix}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: '#ff4b4b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Store Current Matrix
          </button>
          <button
            onClick={clearMatrices}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Clear Matrices
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '20px' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>3D Point Visualization</h1>
        <p style={{ margin: '0 0 20px 0', color: '#666' }}>
          Visualize 4 sample points in 3D space with interactive controls and camera extrinsic matrix
        </p>

        {/* 3D Plot */}
        <div style={{ marginBottom: '30px' }}>
          <Plot
            data={plotData}
            layout={{
              scene: {
                xaxis: { title: { text: 'X Axis' }, backgroundcolor: 'rgba(0,0,0,0)' },
                yaxis: { title: { text: 'Y Axis' }, backgroundcolor: 'rgba(0,0,0,0)' },
                zaxis: { title: { text: 'Z Axis' }, backgroundcolor: 'rgba(0,0,0,0)' },
                bgcolor: 'rgba(0,0,0,0)',
                camera: {
                  eye: { x: 1.5, y: 1.5, z: 1.5 }
                }
              },
              width: undefined,
              height: 600,
              margin: { r: 20, b: 10, l: 10, t: 10 },
              showlegend: true,
              autosize: true
            }}
            config={{ responsive: true }}
            style={{ width: '100%', height: '600px' }}
          />
        </div>

        {/* Data tables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          {/* World Coordinates */}
          <div>
            <h3>World Coordinates</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f2f6' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Point</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>X</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Y</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Z</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(points).map(([name, point]) => (
                  <tr key={name}>
                    <td style={{ border: '1px solid #ddd', padding: '8px', color: point.color, fontWeight: 'bold' }}>
                      {name}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                      {point.coords[0].toFixed(2)}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                      {point.coords[1].toFixed(2)}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                      {point.coords[2].toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Camera Coordinates */}
          <div>
            <h3>Camera Coordinates</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f2f6' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Point</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>X</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Y</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>Z</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(points).map(([name, point]) => {
                  const cameraCoords = transformToCameraCoords(point.coords);
                  return (
                    <tr key={name}>
                      <td style={{ border: '1px solid #ddd', padding: '8px', color: point.color, fontWeight: 'bold' }}>
                        {name}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                        {cameraCoords[0].toFixed(2)}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                        {cameraCoords[1].toFixed(2)}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>
                        {cameraCoords[2].toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Camera Extrinsic Matrix */}
          <div>
            <h3>Camera Extrinsic Matrix</h3>
            <p style={{ fontSize: '14px', margin: '5px 0' }}>
              <strong>Position:</strong> ({cameraPos.x.toFixed(2)}, {cameraPos.y.toFixed(2)}, {cameraPos.z.toFixed(2)})
            </p>
            <p style={{ fontSize: '14px', margin: '5px 0' }}>
              <strong>Rotation:</strong> ({cameraRot.x.toFixed(1)}°, {cameraRot.y.toFixed(1)}°, {cameraRot.z.toFixed(1)}°)
            </p>
            <p style={{ fontSize: '14px', margin: '5px 0 10px 0' }}>
              <strong>Extrinsic Matrix [R|t]:</strong>
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <tbody>
                {extrinsicMatrix.map((row, i) => (
                  <tr key={i}>
                    {row.map((val, j) => (
                      <td key={j} style={{ 
                        border: '1px solid #ddd', 
                        padding: '4px', 
                        textAlign: 'right',
                        backgroundColor: j === 3 ? '#f9f9f9' : 'white'
                      }}>
                        {val.toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stored matrices */}
        {storedMatrices.length > 0 && (
          <div>
            <h3>Stored Camera Matrices</h3>
            {storedMatrices.map((entry, i) => (
              <details key={i} style={{ marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <summary style={{ 
                  padding: '10px', 
                  backgroundColor: '#f9f9f9', 
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}>
                  {entry.timestamp} - Pos: ({entry.camera_pos[0].toFixed(1)}, {entry.camera_pos[1].toFixed(1)}, {entry.camera_pos[2].toFixed(1)})
                </summary>
                <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <p><strong>Camera Position:</strong></p>
                    <p>X: {entry.camera_pos[0].toFixed(2)}</p>
                    <p>Y: {entry.camera_pos[1].toFixed(2)}</p>
                    <p>Z: {entry.camera_pos[2].toFixed(2)}</p>
                    <p><strong>Rotation (degrees):</strong></p>
                    <p>X: {entry.rotation[0].toFixed(1)}°</p>
                    <p>Y: {entry.rotation[1].toFixed(1)}°</p>
                    <p>Z: {entry.rotation[2].toFixed(1)}°</p>
                  </div>
                  <div>
                    <p><strong>Extrinsic Matrix:</strong></p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <tbody>
                        {entry.matrix.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((val, ci) => (
                              <td key={ci} style={{ 
                                border: '1px solid #ddd', 
                                padding: '4px', 
                                textAlign: 'right',
                                backgroundColor: ci === 3 ? '#f9f9f9' : 'white'
                              }}>
                                {val.toFixed(3)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div style={{ marginTop: '40px' }}>
          <h3>Instructions</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#333' }}>
            <p><strong>3D Navigation:</strong></p>
            <ul>
              <li>Click and drag on the plot to rotate the view</li>
              <li>Use mouse wheel to zoom in/out</li>
              <li>Double-click to reset the view</li>
              <li>Hover over points to see their coordinates</li>
            </ul>

            <p><strong>Point Controls:</strong></p>
            <ul>
              <li>Use the sliders in the sidebar to move the points around in 3D space</li>
              <li><strong>World Coordinates</strong>: Original 3D positions of the points</li>
              <li><strong>Camera Coordinates</strong>: How the points appear from the camera's perspective (after applying extrinsic matrix transformation)</li>
            </ul>

            <p><strong>Camera Controls:</strong></p>
            <ul>
              <li>Adjust camera position (X, Y, Z) and rotation (Euler angles)</li>
              <li>The black diamond shows the camera position</li>
              <li>Colored lines show the camera's coordinate axes (red=X, green=Y, blue=Z)</li>
              <li>Click "Store Current Matrix" to save the current camera configuration</li>
              <li>View stored matrices in the expandable sections below</li>
            </ul>

            <p><strong>Camera Extrinsic Matrix:</strong></p>
            <ul>
              <li>The 3×4 matrix [R|t] represents camera pose in world coordinates</li>
              <li>R (3×3): Rotation matrix describing camera orientation</li>
              <li>t (3×1): Translation vector describing camera position</li>
              <li>This matrix transforms world coordinates to camera coordinates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointVisualization3D;