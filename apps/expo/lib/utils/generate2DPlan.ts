type Point = [number, number, number]

const wallColor = "#050505";
const floorColor = "#eaeaea";
const floorFill = "#eaeaea";
const subFloorColor = "#e0e0e0";
const subFloorFill = "#e0e0e0";
const doorColor = "#111111";
const windowColor = "#1c1c1c";
const objectColor = "#9b9b9b";
const objectFill = "#bababa";
const openingColor = "#3d3d3d";
const ftFill = "#ffffff";
const ftColor = "#000000";

const scaleFactor = 100;

const wallWidth = 0.08 * scaleFactor;
const floorWidth = 0.08 * scaleFactor;
const subFloorWidth = 0.04 * scaleFactor;
const doorWidth = 0.02 * scaleFactor;
const windowWidth = 0.02 * scaleFactor;
const objectWidth = 0.05 * scaleFactor;
const openingWidth = 0.04 * scaleFactor;

export type EntireRooms = {
    entireRoom: Room,
    rooms: Room[],
    originalRooms: Room[]
}

export type Room = {
    walls: Point[][];
    floors: Point[][];
    doors: Point[][];
    windows: Point[][];
    openings: Point[][];
    objects: Point[][];
}

const inchText = (meters: number) => {
    const inches = Math.round(meters * 39.3701); // Convert meters to inches
    const inchesText = `${Math.floor(inches / 12)}'${inches % 12}"`;
    return inchesText;
}

function checkPointInPolygon(point: Point, polygons: Point[][]) {
    const [px, _p, py] = point;
    let inside = false;

    for (let i = 0, j = polygons.length - 1; i < polygons.length; j = i++) {
        const polygon = polygons[i];
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [xi, _q, yi] = polygon[i];
            const [xj, _r, yj] = polygon[j];
            const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
    }
    return inside;
}

function findEdgePointsOfLine(points: Point[]) {
    const minX = Math.min(...points.map(p => p[0]));
    const maxX = Math.max(...points.map(p => p[0]));
    const minZ = Math.min(...points.map(p => p[2]));
    const maxZ = Math.max(...points.map(p => p[2]));

    const p00 = [[minX, 0, minZ], [maxX, 0, maxZ]];
    const p01 = [[minX, 0, maxZ], [maxX, 0, minZ]]; 

    return points.find(p => p[0] === minX && p[2] === minZ) ? p00 : p01;
}

function drawWallLength(points: Point[], floors: Point[][], rootFloors: Point[][], color = "black", width = 0.01, fill = "none") {
    const w0 = wallWidth * 3, w1 = -wallWidth * 3;
    let mp = [points[0][0] + (points[1][0] - points[0][0]) / 2, points[0][2] + (points[1][2] - points[0][2]) / 2];

    const [_p0, _p1] = findEdgePointsOfLine(points);
    const p0 = [_p0[0], _p0[2]];
    const p1 = [_p1[0], _p1[2]];
    let length = Math.sqrt(Math.pow(p0[0] - p1[0], 2) + Math.pow(p0[1] - p1[1], 2));

    const dx = p0[0] - p1[0];
    const dy = p0[1] - p1[1];
    const ux = -dy / length;
    const uy = dx / length;
    const fontSize = wallWidth * 2;

    const p00 = [p0[0] + ux * w0, p0[1] + uy * w0];
    const p01 = [p0[0] + ux * w1, p0[1] + uy * w1];
    const p10 = [p1[0] + ux * w0, p1[1] + uy * w0];
    const p11 = [p1[0] + ux * w1, p1[1] + uy * w1];

    const mp0 = [mp[0] + ux * w0, mp[1] + uy * w0];
    const mp1 = [mp[0] + ux * w1, mp[1] + uy * w1];

    const p0InFloor = checkPointInPolygon([mp0[0], 0, mp0[1]], floors);
    const p0InRootFloor = checkPointInPolygon([mp0[0], 0, mp0[1]], rootFloors);
    const p1InFloor = checkPointInPolygon([mp1[0], 0, mp1[1]], floors);
    const p1InRootFloor = checkPointInPolygon([mp1[0], 0, mp1[1]], rootFloors);

    let measureLine = null

    if (!measureLine && !p0InFloor && !p0InRootFloor) {
        measureLine = [p00, p10]
    }
    if (!measureLine && !p1InFloor && !p1InRootFloor) {
        measureLine = [p01, p11]
    }
    if (!measureLine && p0InFloor && p0InRootFloor) {
        measureLine = [p00, p10]
    }
    if (!measureLine && p1InFloor && p1InRootFloor) {
        measureLine = [p01, p11]
    }

    if (!measureLine) { return }

    const inchesText = inchText(length /100 * 1.15);

    // Draw measurement line
    const textLength = inchesText.length * (fontSize / 1.5);
    const dashLength = (length - textLength) / 2;
    const lineSvg = `<line x1="${measureLine[0][0]}" y1="${measureLine[0][1]}" x2="${measureLine[1][0]}" y2="${measureLine[1][1]}" stroke-dasharray="${dashLength} ${textLength}" stroke="${color}" stroke-width="${width}" fill="${fill}" />`;

    const dotSvg = `<circle cx="${measureLine[0][0]}" cy="${measureLine[0][1]}" r="${fontSize / 4}" fill="${color}" /><circle cx="${measureLine[1][0]}" cy="${measureLine[1][1]}" r="${fontSize / 4}" fill="${color}" />`;

    // Calculate midpoint and rotation angle
    const midX = (measureLine[0][0] + measureLine[1][0]) / 2;
    const midY = (measureLine[0][1] + measureLine[1][1]) / 2;
    const angle = Math.atan2(
        measureLine[1][1] - measureLine[0][1],
        measureLine[1][0] - measureLine[0][0]
    ) * (180 / Math.PI);

    // Create text element
    const textSvg = `<text x="${midX}" y="${midY}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="monospace"
        fill="${color}" font-size="${fontSize}"
        transform="rotate(${angle}, ${midX}, ${midY})">${inchesText}</text>`;
    return lineSvg + textSvg + dotSvg;
}

function getSmallestBoundingSquare(points: [number, number][]): { width: number, height: number } {
    if (points.length < 3) throw new Error("A polygon requires at least 3 points");

    function getRotatedPoints(points: [number, number][], angle: number): [number, number][] {
        return points.map(([x, y]) => {
            return [
                x * Math.cos(angle) - y * Math.sin(angle),
                x * Math.sin(angle) + y * Math.cos(angle)
            ];
        });
    }

    function getBoundingBox(points: [number, number][]) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const [x, y] of points) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
        return { width: maxX - minX, height: maxY - minY };
    }

    let minSquareSize = Infinity;
    let bestBoundingBox: { width: number, height: number } = {
        width: 0,
        height: 0
    };

    for (let i = 0; i < points.length; i++) {
        let p1 = points[i];
        let p2 = points[(i + 1) % points.length];
        let angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
        let rotatedPoints = getRotatedPoints(points, -angle);
        let { width, height } = getBoundingBox(rotatedPoints);
        let squareSize = width * height;

        if (squareSize < minSquareSize) {
            minSquareSize = squareSize;
            bestBoundingBox = { width, height };
        }
    }

    return bestBoundingBox;
}

function calculatePolygonProperties(inputPoints: Point[]) {
    if (inputPoints.length < 3) return { area: 0, centroid: null }; // Not a polygon

    const points: [number, number][] = inputPoints.map(p => [p[0], p[2]]);

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

    const boundingBox = getSmallestBoundingSquare(points);

    return {
        area: area / scaleFactor / scaleFactor,
        centroid: { x: cx, y: cy },
        boundingBox
    };
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
     // Add null/undefined check and ensure wall has at least 2 points
    if (!wall || wall.length < 2 || !wall[0] || !wall[1]) {
        return 0; // Default angle if wall is invalid
    }
    const start = wall[0];
    const end = wall[1];
    const dx = end[0] - start[0]; // Change in x
    const dz = end[2] - start[2]; // Change in z
    //console.log("angle: ", -Math.atan2(dz, dx) * 180 / 3.141592);   // Angle to align with x-axis
    return -Math.atan2(dz, dx);   // Angle to align with x-axis
}

let maxWall: Point[] = [[0, 0, 0], [0, 0, 0]];
let maxIndex: number;
let maxLength = -Infinity

function alignRoomHorizontallyXZ(room: Room, initAngle: number | undefined = undefined) {
    // Choose a wall to align with the x-axis in the xz plane
    let maxWall = room.walls[0];
    const [p0, p1] = findEdgePointsOfLine(maxWall)
    maxLength = Math.sqrt(Math.pow(p0[0] - p1[0], 2) + Math.pow(p0[2] - p1[2], 2));
    let index = 0;
    room.walls.forEach((_wall, _index) => {
        const [p0, p1] = findEdgePointsOfLine(_wall)
        const length = Math.sqrt(Math.pow(p0[0] - p1[0], 2) + Math.pow(p0[2] - p1[2], 2));
        if (length > maxLength) {
            maxLength = length;
            maxWall = _wall;
            maxIndex = _index;
        }
    });

    console.log('maxIndex: ', maxIndex);
    
    const angle = initAngle || calculateRotationAngleXZ(maxWall);

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

    return { room, angle };
}

// Helper to calculate angle between two segments in XZ plane
function calculateAngleForSegment(segment: Point[], wall: Point[]): number {

    // Check if segment and wall are valid
    if (!segment || segment.length < 2 || !wall || wall.length < 2) {
        return 0; // Default angle if segment or wall is invalid
    }
    const [a0, a1] = wall;
    const [b0, b1] = segment;

    // Vector A (basis wall)
    const ax = a1[0] - a0[0];
    const az = a1[2] - a0[2];

    // Vector B (current wall)
    const bx = b1[0] - b0[0];
    const bz = b1[2] - b0[2];

    const dot = ax * bx + az * bz;
    const magA = Math.sqrt(ax * ax + az * az);
    const magB = Math.sqrt(bx * bx + bz * bz);

    const cosTheta = dot / (magA * magB);
    const clampedCos = Math.max(-1, Math.min(1, cosTheta));
    const angleRad = Math.acos(clampedCos);

    return angleRad * (180 / Math.PI); // convert to degrees
}

// Main function to calculate angles for all walls
function calculateAllAngles(room: Room): number[] {
    const angles: number[] = [];
    room.walls.forEach(wall => {
        //console.log(wall);
        if (wall.length === 2) {
            angles.push(calculateAngleForSegment(wall, maxWall));
        }
    });

    //console.log(angles);
    return angles;
}

export function makeSVG(data: EntireRooms, _roomNames: string[], mainRoomName: string) {
    // const {room, angle} = alignRoomHorizontallyXZ(data.entireRoom);
    // const subRooms = data.rooms.map(room => alignRoomHorizontallyXZ(room, angle).room);

    const originalRoomKeys = (data.originalRooms || []).map(room =>
        `${(room.walls || []).length}-${(room.floors || []).length}-${(room.doors || []).length}-${(room.windows || []).length}-${(room.openings || []).length}-${(room.objects || []).length}`
    );
    const newRooMkeys = (data.rooms || []).map(room =>
        `${(room.walls || []).length}-${(room.floors || []).length}-${(room.doors || []).length}-${(room.windows || []).length}-${(room.openings || []).length}-${(room.objects || []).length}`
    );

    const roomNames: string[] = []
    newRooMkeys.forEach((key) => {
        const idx = originalRoomKeys.findIndex(originalKey => originalKey === key);
        if (idx !== -1) {
            roomNames.push(_roomNames[idx]);
        } else {
            roomNames.push('');
        }
    })

    const _room: Room = JSON.parse(JSON.stringify(data.entireRoom))
    const _subRooms: Room[] = JSON.parse(JSON.stringify(data.rooms || []));

    const { room, angle } = alignRoomHorizontallyXZ(_room);
    const subRooms = _subRooms.map(room => alignRoomHorizontallyXZ(room, angle).room);

    maxWall = room.walls[maxIndex];

    calculateAllAngles(room);
    let matchCount: number[] = [];
    for(let i = 0; i < room.walls.length; i++) {
        matchCount[i] = 0;
        for(let j = 0; j < room.walls.length; j++) {
            if(Math.abs(calculateAngleForSegment(room.walls[j], room.walls[i])) < 0.01) {
                matchCount[i]++;
            }
        }
    }

    for(let i = 0; i < room.walls.length; i++) {
        if(matchCount[maxIndex] < matchCount[i]) maxIndex = i;
    }

    maxWall = room.walls[maxIndex];

    let angles = [];
    angles= calculateAllAngles(room);

    let errWalls: number[] = [];
    let errors: number[] = [];

    for(let i = 0; i < room.walls.length; i++) {
        if(Math.abs(angles[i] - 0) > 0.3 && Math.abs(angles[i] - 90) > 0.3 && Math.abs(angles[i] - 180) > 0.3) {
            if(Math.min(Math.abs(angles[i] - 0), Math.abs(angles[i] - 90), Math.abs(angles[i] - 180)) > 10.0) {
                //console.log('index of wall have not be rotated', i);
                continue;
            }
            errWalls.push(i);
            errors.push(Math.min(Math.abs(angles[i] - 0), Math.abs(angles[i] - 90), Math.abs(angles[i] - 180)));
        }
    }

    //console.log('error walls:', errWalls);
    //console.log('errors:', errors);

    errWalls.forEach(_wall => {
        
    });

    function rotatePointAround(p: Point, center: Point, angleDeg: number): Point {
        const angleRad = (Math.PI / 180) * angleDeg;
        const dx = p[0] - center[0];
        const dz = p[2] - center[2];
        const xRot = dx * Math.cos(angleRad) - dz * Math.sin(angleRad);
        const zRot = dx * Math.sin(angleRad) + dz * Math.cos(angleRad);
        return [xRot + center[0], p[1], zRot + center[2]];
    }

    //determine the rotation direction and apply rotatation.

    function distance(p1: Point, p2: Point): number {
        const dx = p1[0] - p2[0];
        const dz = p1[2] - p2[2];
        return Math.sqrt(dx * dx + dz * dz);
    }

    errWalls.forEach((wallIndex, idx) => {
        const wall = room.walls[wallIndex];
        const errorAngle = errors[idx];

        const start = wall[0];
        const end = wall[1];
        const center: Point = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2];

        const rotateAndCompare = (angle: number): number => {
            const newStart = rotatePointAround(start, center, angle);
            const newEnd = rotatePointAround(end, center, angle);

            let minDist = Infinity;
            for (let otherWall of room.walls) {
                if (otherWall === wall) continue;
                minDist = Math.min(minDist,
                    distance(newStart, otherWall[0]),
                    distance(newStart, otherWall[1]),
                    distance(newEnd, otherWall[0]),
                    distance(newEnd, otherWall[1])
                );
            }
            return minDist;
        };

        const distPos = rotateAndCompare(errorAngle);
        const distNeg = rotateAndCompare(-errorAngle);

        const bestAngle = distPos < distNeg ? errorAngle : -errorAngle;
        wall[0] = rotatePointAround(start, center, bestAngle);
        wall[1] = rotatePointAround(end, center, bestAngle);

        room.walls[wallIndex] = wall;
    });

    //Rotate doors

    function segmentsIntersect(p1: Point, p2: Point, q1: Point, q2: Point): boolean {
    function ccw(a: Point, b: Point, c: Point): boolean {
        return (c[2] - a[2]) * (b[0] - a[0]) > (b[2] - a[2]) * (c[0] - a[0]);
    }

        return (ccw(p1, q1, q2) !== ccw(p2, q1, q2)) && (ccw(p1, p2, q1) !== ccw(p1, p2, q2));
    }

    function calculateLineAngleDeg(start: Point, end: Point): number {
        return Math.atan2(end[2] - start[2], end[0] - start[0]) * (180 / Math.PI);
    }

    function rotateLineAroundCenter(start: Point, end: Point, angleDeg: number): [Point, Point] {
        const center: Point = [
            (start[0] + end[0]) / 2,
            (start[1] + end[1]) / 2,
            (start[2] + end[2]) / 2
        ];
        return [
            rotatePointAround(start, center, angleDeg),
            rotatePointAround(end, center, angleDeg)
        ];
    }

    function isAngleDeviationSignificant(angleDeg: number): boolean {
        const targets = [0, 90, 180, 270];
        return Math.min(...targets.map(t => Math.abs(angleDeg - t))) > 0.3;
    }

    const rotatedDoorIndices = new Set<number>();

    room.walls.forEach((wall, wallIndex) => {
        const wallStart = wall[0];
        const wallEnd = wall[1];
        const wallAngle = calculateLineAngleDeg(wallStart, wallEnd);

        room.doors.forEach((door, doorIndex) => {
            if (rotatedDoorIndices.has(doorIndex)) return;

            const doorStart = door[0];
            const doorEnd = door[1];

            // ✅ Only proceed if segments intersect
            if (!segmentsIntersect(wallStart, wallEnd, doorStart, doorEnd)) return;

            const doorAngle = calculateLineAngleDeg(doorStart, doorEnd);
            const deviation = Math.abs(doorAngle - wallAngle);

            if (isAngleDeviationSignificant(deviation)) {
                // Try rotating in both directions
                const [rotatedStartPos, rotatedEndPos] = rotateLineAroundCenter(doorStart, doorEnd, -deviation);
                const [rotatedStartNeg, rotatedEndNeg] = rotateLineAroundCenter(doorStart, doorEnd, deviation);

                const anglePos = calculateLineAngleDeg(rotatedStartPos, rotatedEndPos);
                const angleNeg = calculateLineAngleDeg(rotatedStartNeg, rotatedEndNeg);

                const diffPos = Math.abs(anglePos - wallAngle);
                const diffNeg = Math.abs(angleNeg - wallAngle);

                if (diffPos < diffNeg) {
                    room.doors[doorIndex] = [rotatedStartPos, rotatedEndPos];
                } else {
                    room.doors[doorIndex] = [rotatedStartNeg, rotatedEndNeg];
                }

                rotatedDoorIndices.add(doorIndex);
            }
        });
    });

    function createPolyline(points: Point[], color = "black", width = 0.05, fill = "none") {
        const pointsStr = points.map(p => `${p[0]},${p[2]}`).join(" ");
        return `<polyline stroke-linecap="square" points="${pointsStr}" stroke="${color}" stroke-width="${width}" fill="${fill}" />`;
    }

    function createPoylLineOverWall(points: Point[], color = "black", width = 0.05, fill = "none") {
        const pointsStr = points.map(p => `${p[0]},${p[2]}`).join(" ");
        const wallCover = `<polyline stroke-linecap="butt" points="${pointsStr}" stroke="${floorFill}" stroke-width="${wallWidth}" fill="${fill}" />`;
        return wallCover + `<polyline stroke-dasharray="${wallWidth} ${wallWidth / 1.5}" stroke-linecap="butt" points="${pointsStr}" stroke="${color}" stroke-width="${width}" fill="${fill}" />`;
    }

    const keys: (keyof Room)[] = ['floors', 'objects', 'walls', 'doors', 'windows', 'openings'];

    for (const key of keys) {
        if (room[key]) {
            room[key] = (room[key] || []).map((points: Point[]) => points.map(([x, y, z]) => [x * scaleFactor, 0, z * scaleFactor]));
        }
        subRooms.forEach(subRoom => {
            if (subRoom[key]) {
                subRoom[key] = (subRoom[key] || []).map((points: Point[]) => points.map(([x, y, z]) => [x * scaleFactor, 0, z * scaleFactor]));
            }
        })
    }

    // Get all points from the room
    const allPoints = [
        ...room.walls.flat(),
        ...room.floors.flat(),
        ...room.doors.flat(),
        ...room.windows.flat(),
        ...room.openings.flat()
    ];

    if (allPoints.length === 0) return {
        x1: Infinity,
        y1: Infinity,
        x2: -Infinity,
        y2: -Infinity,
        svg: '',
        area: 0
    }; // Return empty SVG if no points exist

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
    let wallLengthMeasure = "";
    let totalArea = 0;
    const processFLoor = (floor: Point[], isMainRoom = true, roomIndex = 0) => {
        if (floor.length) {
            const roomName = isMainRoom ? 'Total' : roomNames[roomIndex];
            svgContent += createPolyline(floor,
                isMainRoom ? floorColor : subFloorColor,
                isMainRoom ? floorWidth : subFloorWidth,
                isMainRoom ? floorFill : subFloorFill
            );
            const { area, centroid } = calculatePolygonProperties(floor);
            if (isMainRoom) { totalArea += area }
            const areaInSqFt = (area * 10.764).toFixed(1); // Convert m² to ft²
            const ftSize = isMainRoom ? 22 : 18;
            if (centroid) {
                sqftContent += `<text x="${centroid.x}" y="${centroid.y - ftSize * 1.5}" 
                    fill="${ftColor}"
                    text-anchor="middle" 
                    dominant-baseline="middle"
                    font-weight="bold"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="${ftSize}">${roomName}</text>`;
                sqftContent += `<text x="${centroid.x}" y="${centroid.y}" 
                    fill="${ftColor}"
                    text-anchor="middle" 
                    dominant-baseline="middle"
                    font-weight="bold"
                    font-family="Arial, Helvetica, sans-serif"
                    font-size="${ftSize}">${areaInSqFt} sq ft</text>`;
            }
        }
    }

    room.floors.forEach(floor => {
        processFLoor(floor, true)
    });
    if (subRooms.length > 1) {
        subRooms.forEach((subRoom, sIdx) => {
            subRoom.floors.forEach(floor => {
                processFLoor(floor, false, sIdx)
            });
        })
    }
    room.objects.forEach(object => {
        if (object.length) svgContent += createPolyline(object, objectColor, objectWidth, objectFill);
    });
    // if (subRooms.length > 1) {
    //     subRooms.forEach((subRoom, sIdx) => {
    //         subRoom.walls.forEach((wall, index) => {
    //             if (wall.length) {
    //                 // if(sIdx !== 1) return;
    //                 svgContent += createPolyline(wall, wallColor, wallWidth);
    //                 wallLengthMeasure += drawWallLength(wall, subRoom.floors, room.floors, wallColor, wallWidth / 5, undefined, index, sIdx, "sub");
    //             }
    //         })
    //     })
    // } else
     {
        room.walls.forEach((wall, index) => {
            if (wall.length) {
                svgContent += createPolyline(wall, wallColor, wallWidth);
                wallLengthMeasure += drawWallLength(wall, room.floors, room.floors, wallColor, wallWidth / 5, undefined);
            }
        });
    }
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
                stroke-linecap="square"/>`;
        }
    });
    room.windows.forEach(window => {
        if (window.length) svgContent += createPoylLineOverWall(window, windowColor, windowWidth);
    });
    // room.openings.forEach(opening => {
    //     if (opening.length) svgContent += createPolyline(opening, openingColor, openingWidth);
    // });
    if (sqftContent) svgContent += sqftContent;
    if (wallLengthMeasure) svgContent += wallLengthMeasure;

    return `<svg  xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}">${svgContent}</svg>`;
}
