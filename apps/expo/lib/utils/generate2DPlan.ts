type Point = [number, number, number]

const wallWidth = 0.08;
const floorWidth = 0.08;
const doorWidth = 0.02;
const windowWidth = 0.02;
const objectWidth = 0.05;
const openingWidth = 0.04;

const wallColor = "#050505";
const floorColor = "#eaeaea";
const floorFill = "#eaeaea";
const doorColor = "#111111";
const windowColor = "#1c1c1c";
const objectColor = "#9b9b9b";
const objectFill = "#bababa";
const openingColor = "#3d3d3d";
const ftFill = "#ffffff";
const ftColor = "#000000";

export type Room = {
    walls: Point[][];
    floors: Point[][];
    doors: Point[][];
    windows: Point[][];
    openings: Point[][];
    objects: Point[][];
}

function calculatePolygonProperties(inputPoints: Point[]) {
    if (inputPoints.length < 3) return { area: 0, centroid: null }; // Not a polygon

    const points = inputPoints.map(p => [p[0], p[2]]);

    let area = 0;
    let cx = 0, cy = 0;

    const n = points.length;
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n; // Next point (loop back at end)
        const crossProduct = points[i][0] * points[j][1] - points[j][0] * points[i][1];
        
        area += crossProduct;
        cx += (points[i][0] + points[j][0]) * crossProduct;
        cy += (points[i][1] + points[j][1]) * crossProduct;
    }

    area = Math.abs(area) / 2;

    if (area === 0) return { area: 0, centroid: null }; // Degenerate case

    cx = cx / (6 * area);
    cy = cy / (6 * area);

    return { area, centroid: { x: cx, y: cy } };
}

function rotatePointXZ(point: Point, angle: number): Point {
    const x = point[0];
    const z = point[2];
    const cosTheta = Math.cos(angle);
    const sinTheta = Math.sin(angle);
    return [
        x * cosTheta - z * sinTheta, // New x-coordinate
        point[1],                    // y-coordinate remains unchanged
        x * sinTheta + z * cosTheta  // New z-coordinate
    ];
}

function calculateRotationAngleXZ(wall: Point[]) {
    const start = wall[0];
    const end = wall[1];
    const dx = end[0] - start[0]; // Change in x
    const dz = end[2] - start[2]; // Change in z
    return -Math.atan2(dz, dx);   // Angle to align with x-axis
}

function alignRoomHorizontallyXZ(room: Room) {
    // Choose a wall to align with the x-axis in the xz plane
    const wall = room.walls[0];
    const angle = calculateRotationAngleXZ(wall);

    // Function to rotate all points in the room around the y-axis
    function rotateAllPointsXZ(points: Point[]) {
        return points.map(point => rotatePointXZ(point, angle));
    }

    // Apply rotation to all walls
    room.walls = room.walls.map(wall => rotateAllPointsXZ(wall));

    // Apply rotation to windows, doors, floors, and openings if they exist
    if (room.windows) {
        room.windows = room.windows.map(window => rotateAllPointsXZ(window));
    }
    if (room.doors) {
        room.doors = room.doors.map(door => rotateAllPointsXZ(door));
    }
    if (room.floors) {
        room.floors = room.floors.map(floor => rotateAllPointsXZ(floor));
    }
    if (room.openings) {
        room.openings = room.openings.map(opening => rotateAllPointsXZ(opening));
    }
    if (room.objects) {
        room.objects = room.objects.map(object => rotateAllPointsXZ(object));
    }
    if (room.openings) {
        room.openings = room.openings.map(opening => rotateAllPointsXZ(opening));
    }

    return room;
}

export function makeSVG(data: Room) {
    const room = alignRoomHorizontallyXZ(data);

    function createPolyline(points: Point[], color = "black", width = 0.05, fill="none") {
        const pointsStr = points.map(p => `${p[0]},${p[2]}`).join(" ");
        return `<polyline stroke-linecap="square" points="${pointsStr}" stroke="${color}" stroke-width="${width}" fill="${fill}" />`;
    }

    function createPoylLineOverWall(points: Point[], color = "black", width = 0.05, fill="none") {
        const pointsStr = points.map(p => `${p[0]},${p[2]}`).join(" ");
        const wallCover = `<polyline stroke-linecap="butt" points="${pointsStr}" stroke="${floorFill}" stroke-width="${wallWidth}" fill="${fill}" />`;
        return wallCover + `<polyline stroke-dasharray="${wallWidth} ${wallWidth / 1.5}" stroke-linecap="butt" points="${pointsStr}" stroke="${color}" stroke-width="${width}" fill="${fill}" />`;
    }

    // Get all points from the room
    const allPoints = [
        ...room.walls.flat(),
        ...room.floors.flat(),
        ...room.doors.flat(),
        ...room.windows.flat(),
        ...room.openings.flat()
    ];

    if (allPoints.length === 0) return "<svg></svg>"; // Return empty SVG if no points exist

    // Calculate bounding box
    const minX = Math.min(...allPoints.map(p => p[0]));
    const maxX = Math.max(...allPoints.map(p => p[0]));
    const minZ = Math.min(...allPoints.map(p => p[2]));
    const maxZ = Math.max(...allPoints.map(p => p[2]));

    // Calculate padding (15% of range)
    const paddingX = (maxX - minX) * 0.15;
    const paddingZ = (maxZ - minZ) * 0.15;

    const viewBoxX = minX - paddingX;
    const viewBoxY = minZ - paddingZ;
    const viewBoxWidth = (maxX - minX) + 2 * paddingX;
    const viewBoxHeight = (maxZ - minZ) + 2 * paddingZ;

    // Construct SVG string
    let svgContent = "";
    let sqftContent = "";
    room.floors.forEach(floor => {
        if (floor.length) {
            svgContent += createPolyline(floor, floorColor, floorWidth, floorFill);
            const { area, centroid } = calculatePolygonProperties(floor);
            const areaInSqFt = (area * 10.764).toFixed(1); // Convert m² to ft²
            if (centroid) {
                sqftContent += `<text x="${centroid.x}" y="${centroid.y}" 
                    fill="${ftFill}" 
                    stroke="${ftColor}"
                    stroke-width="0.02"
                    text-anchor="middle" 
                    dominant-baseline="middle"
                    font-weight="bold"
                    font-size="0.3">${areaInSqFt} ft²</text>`;
            }
        }
    });
    room.objects.forEach(object => {
        if (object.length) svgContent += createPolyline(object, objectColor, objectWidth, objectFill);
    });
    room.walls.forEach(wall => {
        if (wall.length) svgContent += createPolyline(wall, wallColor, wallWidth);
    });
    room.doors.forEach(door => {
        if (door.length) {
            svgContent += createPoylLineOverWall(door, doorColor, doorWidth);
            // Add door swing arc
            const [start, end] = door;
            const doorLength = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[2] - start[2], 2));
            // Calculate rotated end point for door swing
            const angle = Math.PI / 6; // 30 degrees in radians
            const rotatedX = start[0] + (end[0] - start[0]) * Math.cos(angle) - (end[2] - start[2]) * Math.sin(angle);
            const rotatedZ = start[2] + (end[0] - start[0]) * Math.sin(angle) + (end[2] - start[2]) * Math.cos(angle);
            
            // Create arc path
            svgContent += `<path d="M ${end[0]} ${end[2]} A ${doorLength} ${doorLength} 0 0 1 ${rotatedX} ${rotatedZ}"
                stroke="${doorColor}"
                stroke-width="${doorWidth}"
                stroke-dasharray="0.1"
                fill="none"/>`;

            // Draw dashed line connecting start point to rotated end point
            svgContent += `<line x1="${start[0]}" y1="${start[2]}" x2="${rotatedX}" y2="${rotatedZ}"
                stroke="${doorColor}"
                stroke-width="${wallWidth}"
                stroke-linecap="butt"/>`;
        }
    });
    room.windows.forEach(window => {
        if (window.length) svgContent += createPoylLineOverWall(window, windowColor, windowWidth);
    });
    room.openings.forEach(opening => {
        if (opening.length) svgContent += createPolyline(opening, openingColor, openingWidth);
    });
    if (sqftContent) svgContent += sqftContent;

    return `<svg viewBox="${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}">${svgContent}</svg>`;
}
