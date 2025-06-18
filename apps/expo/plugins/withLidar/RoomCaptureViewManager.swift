// DO NOT DELETE THIS FILE @VINCENT

import simd
import ARKit
import UIKit
import Foundation
import RoomPlan
import React
import ReactBridge

import SwiftUI
import _SpriteKit_SwiftUI

let logger = Logger(subsystem: "com.servicegeek.servicegeekmobile", category: "Lidar Scan")

@ReactModule
class RoomScanModule: NSObject, RCTBridgeModule {
  @ReactMethod
  @objc func isAvailable(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    let available = ARWorldTrackingConfiguration.supportsSceneReconstruction(.mesh)
    logger.info("[RoomScanModule] isAvailable \(available)")
    resolve(available)
  }

  @ReactMethod
  @objc func getOutputFiles(callback: RCTResponseSenderBlock) {
    let destinationFolderURL = FileManager.default.temporaryDirectory.appending(path: "Export")
    let destinationURL = destinationFolderURL.appending(path: "Room.usdz")
    let capturedRoomURL = destinationFolderURL.appending(path: "Room.json")
    let transformedRoomURL = destinationFolderURL.appending(path: "TransformedRoom.json")

    callback([[
      "destinationURL": destinationURL.absoluteString,
      "capturedRoomURL": capturedRoomURL.absoluteString,
      "transformedRoomURL": transformedRoomURL.absoluteString
    ]])
  }

  @ReactMethod
  @objc func savePngFile(pngBase64: String, callback: RCTResponseSenderBlock) {
    let destinationFolderURL = FileManager.default.temporaryDirectory.appending(path: "Export")
    let destinationURL = destinationFolderURL.appending(path: "Room.png")

    do {
      try FileManager.default.createDirectory(at: destinationFolderURL, withIntermediateDirectories: true)

      // Remove "data:image/png;base64," prefix if present
      let base64String = pngBase64.replacingOccurrences(of: "data:image/png;base64,", with: "")

      if let imageData = Data(base64Encoded: base64String) {
        try imageData.write(to: destinationURL)
        logger.info("[RoomScanModule] Successfully saved PNG to \(destinationURL)")
        callback([["success": true, "path": destinationURL.absoluteString]])
      } else {
        logger.error("[RoomScanModule] Failed to decode base64 string")
        callback([["success": false, "error": "Failed to decode base64 string"]])
      }
    } catch {
      logger.error("[RoomScanModule] Error saving PNG: \(error)")
      callback([["success": false, "error": error.localizedDescription]])
    }
  }
}

struct TransformedRoomValue: Codable {
  let entireRoom: [String: [[simd_float3]]]
  let rooms: [[String: [[simd_float3]]]]
  let originalRooms: [[String: [[simd_float3]]]]
}

@available(iOS 17.0, *)
@ReactView
class RoomScanView: RCTViewManager {
  override func view() -> UIView! {
    let view = RoomCaptureViewWrapper()
//        view.delegate = self
    return view
  }
  
  @ReactProperty(isCustom: true)
  var finish: NSNumber?
  
  @available(iOS 17.0, *)
  @objc
  func set_finish(_ json: NSNumber?, forView: RoomCaptureViewWrapper?, withDefaultView: RoomCaptureViewWrapper?) {
      finish = json
      if finish as! Int > 0 {
          forView?.stopSession(finish: finish ?? 0)
      }
      if finish as! Int == -1 {
          forView?.startSession()
      }
  }
  
  @ReactProperty
  var onCaptureCompleted: RCTBubblingEventBlock?

  @ReactProperty
  var onCaptureError: RCTBubblingEventBlock?
}

@available(iOS 17.0, *)
class RoomCaptureViewWrapper : RCTView, RoomCaptureSessionDelegate {

  private var roomCaptureView: RoomCaptureView!
  private var roomCaptureSessionConfig: RoomCaptureSession.Configuration = RoomCaptureSession.Configuration()
  private var finalResults: CapturedStructure?
  private var roomsArray: [CapturedRoom] = []
  private var needFinish: Bool = false

  @objc var onCaptureCompleted: RCTBubblingEventBlock?
  @objc var onCaptureError: RCTBubblingEventBlock?

  override init(frame: CGRect) {
    super.init(frame: UIScreen.main.bounds)
    setupRoomCapture()
  } 

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setupRoomCapture()
  }

  private func setupRoomCapture() {
    logger.info("[RoomCapture] Setting up RoomCaptureView")
    self.roomCaptureView = RoomCaptureView(frame: self.bounds)
    self.roomCaptureView.captureSession.delegate = self

    let destinationFolderURL = FileManager.default.temporaryDirectory.appending(path: "Export")
    try? FileManager.default.removeItem(at: destinationFolderURL)

    self.addSubview(roomCaptureView)
  }

  public func startSession() {
    logger.info("[RoomCapture] Starting capture session")
    roomCaptureView?.captureSession.run(configuration: roomCaptureSessionConfig)
  }

  public func stopSession(finish: NSNumber) {
    self.needFinish = finish == 2
    logger.info("[RoomCapture] Stopping capture session  \(self.needFinish)")
    self.roomCaptureView?.captureSession.stop(pauseARSession: self.needFinish)
  }

  func captureView(shouldPresent roomDataForProcessing: CapturedRoomData, error: Error?) -> Bool {
    return true
  }

  func captureSession(_ session: RoomCaptureSession, didEndWith data: CapturedRoomData, error: Error?) {
    logger.info("[RoomCapture] didEndWith data")
    if ((error) != nil) { return }
    Task {
      let roomBuilder = RoomBuilder(options: [.beautifyObjects])
      if let capturedRoom = try? await roomBuilder.capturedRoom(from: data) {
        self.roomsArray.append(capturedRoom)

        if (self.needFinish) {
          do {
            let structureBuilder = StructureBuilder(options: .beautifyObjects)
            try self.finalResults = await structureBuilder.capturedStructure(from: self.roomsArray)
            self.saveRoomResult()
          } catch {
            print("Error = \(error)")
            self.onCaptureError?(["message": "Error = \(error)"])
          }
        }
      }
    }
  }

//    func captureView(didPresent processedResult: CapturedRoom, error: Error?) async {
//        logger.info("[RoomCapture] didPresent processedResult")
//        self.roomsArray.append(processedResult)
//
//        if (self.needFinish) {
//            do {
//                let structureBuilder = StructureBuilder(options: .beautifyObjects)
//                try self.finalResults = await structureBuilder.capturedStructure(from: self.roomsArray)
//                self.saveRoomResult()
//            } catch {
//                print("Error = \(error)")
//                self.onCaptureError?(["message": "Error = \(error)"])
//            }
//        }
//    }

  func saveRoomResult() {
    let destinationFolderURL = FileManager.default.temporaryDirectory.appending(path: "Export")
    let destinationURL = destinationFolderURL.appending(path: "Room.usdz")
    let capturedRoomURL = destinationFolderURL.appending(path: "Room.json")
    let transformedRoomURL = destinationFolderURL.appending(path: "TransformedRoom.json")
    do {
      try FileManager.default.createDirectory(at: destinationFolderURL, withIntermediateDirectories: true)
      let jsonEncoder = JSONEncoder()
      let roomJsonData = try jsonEncoder.encode(finalResults)
      let transformedRoom = TransformedRoomValue(
        entireRoom: self.getTransformedRoom(),
        rooms: self.getTransformedRooms(),
        originalRooms: self.getOriginalTransformedRooms()
      )
      let transformedRoomJsonData = try jsonEncoder.encode(transformedRoom)
      try roomJsonData.write(to: capturedRoomURL)
      try transformedRoomJsonData.write(to: transformedRoomURL)
      try self.finalResults?.export(to: destinationURL, exportOptions: .mesh)

      logger.info("[RoomCapture] Successfully processed room \(destinationURL)")
    } catch {
      print("Error = \(error)")
      self.onCaptureError?(["message": "Error = \(error)"])
    }
    self.onCaptureCompleted?(["url": destinationFolderURL])
  }

  func transformPoint(_ point: simd_float3, using transform: simd_float4x4) -> simd_float3 {
    let vector = simd_float4(point.x, point.y, point.z, 1.0)
    let transformedVector = transform * vector
    return simd_float3(transformedVector.x, transformedVector.y, transformedVector.z)
  }

  func surfaceToCoords(surfaces: [CapturedRoom.Surface]) -> [[simd_float3]] {
    let transformedPoints = surfaces.map { surface in
      var extendedCorners = surface.polygonCorners
      if extendedCorners.isEmpty {
          extendedCorners = [surface.dimensions * -0.5, surface.dimensions * 0.5]
      }
      return extendedCorners.map { transformPoint($0, using: surface.transform) }
    }
    return transformedPoints
  }

  func objectToCoords(objects: [CapturedRoom.Object]) -> [[simd_float3]] {
    let transformedPoints = objects.map { object in
      var pll = object.dimensions * -0.5
      var ptr = object.dimensions * 0.5
      let plr = simd_make_float3(pll.x, 0, ptr.z)
      let ptl = simd_make_float3(ptr.x, 0, pll.z)
      pll.y = 0
      ptr.y = 0
      let extendedCorners = [pll, plr, ptr, ptl, pll]
      return extendedCorners.map { transformPoint($0, using: object.transform) }
    }
    return transformedPoints
  }

  func getOriginalTransformedRooms() -> [[String: [[simd_float3]]]] {
    return self.roomsArray.map { room in
      return [
        "floors": surfaceToCoords(surfaces: room.floors),
        "walls": surfaceToCoords(surfaces: room.walls),
        "doors": surfaceToCoords(surfaces: room.doors),
        "windows": surfaceToCoords(surfaces: room.windows),
        "openings": surfaceToCoords(surfaces: room.openings),
        "objects": objectToCoords(objects: room.objects),
      ]
    }
  }
  
  func getTransformedRooms() -> [[String: [[simd_float3]]]] {
    let rooms = self.finalResults?.rooms ?? []
    return rooms.map { room in
      return [
        "floors": surfaceToCoords(surfaces: room.floors),
        "walls": surfaceToCoords(surfaces: room.walls),
        "doors": surfaceToCoords(surfaces: room.doors),
        "windows": surfaceToCoords(surfaces: room.windows),
        "openings": surfaceToCoords(surfaces: room.openings),
        "objects": objectToCoords(objects: room.objects),
      ]
    }
  }

  func getTransformedRoom() -> [String: [[simd_float3]]] {
    return [
      "floors": surfaceToCoords(surfaces: self.finalResults?.floors ?? []),
      "walls": surfaceToCoords(surfaces: self.finalResults?.walls ?? []),
      "doors": surfaceToCoords(surfaces: self.finalResults?.doors ?? []),
      "windows": surfaceToCoords(surfaces: self.finalResults?.windows ?? []),
      "openings": surfaceToCoords(surfaces: self.finalResults?.openings ?? []),
      "objects": objectToCoords(objects: self.finalResults?.objects ?? []),
    ]
  }
}
