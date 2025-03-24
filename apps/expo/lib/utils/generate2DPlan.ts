type Point = [number, number, number]

export type Room = {
    walls: Point[][];
    floors: Point[][];
    doors: Point[][];
    windows: Point[][];
    openings: Point[][];
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

    return room;
}

export function makeSVG(data: Room) {
    const room = alignRoomHorizontallyXZ(data);

    function createPolyline(points: Point[], color = "black", width = 0.05, fill="none") {
        const pointsStr = points.map(p => `${p[0]},${p[2]}`).join(" ");
        return `<polyline points="${pointsStr}" stroke="${color}" stroke-width="${width}" fill="${fill}" />`;
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
    room.walls.forEach(wall => {
        if (wall.length) svgContent += createPolyline(wall, "black", 0.1);
    });
    room.floors.forEach(floor => {
        if (floor.length) svgContent += createPolyline(floor, "black", 0, "white");
    });
    room.doors.forEach(door => {
        if (door.length) svgContent += createPolyline(door, "#777", 0.08);
    });
    room.windows.forEach(window => {
        if (window.length) svgContent += createPolyline(window, "#ccc", 0.08);
    });

    return `<svg viewBox="${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}">${svgContent}</svg>`;
}
