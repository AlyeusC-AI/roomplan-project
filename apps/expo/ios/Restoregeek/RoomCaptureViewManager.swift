import simd
import ARKit
import UIKit
import Foundation
import RoomPlan
import React
import ReactBridge

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
}

@ReactView
class RoomScanView: RCTViewManager {
    override func view() -> UIView! {
        let view = RoomCaptureViewWrapper()
//        view.delegate = self
        return view
    }
    
    @ReactProperty(isCustom: true)
    var finish: Bool?
    
    @objc
    func set_finish(_ json: NSNumber?, forView: RoomCaptureViewWrapper?, withDefaultView: RoomCaptureViewWrapper?) {
        finish = json?.boolValue
        if finish == true {
            forView?.stopSession()
        }
    }
    
    @ReactProperty
    var onCaptureCompleted: RCTBubblingEventBlock?

    @ReactProperty
    var onCaptureError: RCTBubblingEventBlock?
}

class RoomCaptureViewWrapper : UIView, RoomCaptureViewDelegate {

    private var roomCaptureView: RoomCaptureView!
    private var roomCaptureSessionConfig: RoomCaptureSession.Configuration = RoomCaptureSession.Configuration()
    private var finalResults: CapturedRoom?

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
        roomCaptureView = RoomCaptureView(frame: self.bounds)
        roomCaptureView.delegate = self

        let destinationFolderURL = FileManager.default.temporaryDirectory.appending(path: "Export")
        try? FileManager.default.removeItem(at: destinationFolderURL)

        self.addSubview(roomCaptureView)

        startSession()
    }

    public func startSession() {
        logger.info("[RoomCapture] Starting capture session")
        roomCaptureView?.captureSession.run(configuration: roomCaptureSessionConfig)
    }
    
    public func stopSession() {
        logger.info("[RoomCapture] Stopping capture session")
        roomCaptureView?.captureSession.stop()
    }

    func captureView(shouldPresent roomDataForProcessing: CapturedRoomData, error: Error?) -> Bool {
        return true
    }

    func captureView(didPresent processedResult: CapturedRoom, error: Error?) {
        logger.info("[RoomCapture] didPresent processedResult")
        finalResults = processedResult
        
        saveRoomResult()
    }

    func saveRoomResult() {
        let destinationFolderURL = FileManager.default.temporaryDirectory.appending(path: "Export")
        let destinationURL = destinationFolderURL.appending(path: "Room.usdz")
        let capturedRoomURL = destinationFolderURL.appending(path: "Room.json")
        let transformedRoomURL = destinationFolderURL.appending(path: "TransformedRoom.json")
        do {
            try FileManager.default.createDirectory(at: destinationFolderURL, withIntermediateDirectories: true)
            let jsonEncoder = JSONEncoder()
            let transformedRoom = getTransformedRoom()
            let roomJsonData = try jsonEncoder.encode(finalResults)
            let transformedRoomJsonData = try jsonEncoder.encode(transformedRoom)
            try roomJsonData.write(to: capturedRoomURL)
            try transformedRoomJsonData.write(to: transformedRoomURL)
            try finalResults?.export(to: destinationURL, exportOptions: .mesh)
            
            logger.info("[RoomCapture] Successfully processed room \(destinationURL)")
        } catch {
            print("Error = \(error)")
        }
    }

    func transformPoint(_ point: simd_float3, using transform: simd_float4x4) -> simd_float3 {
        let vector = simd_float4(point.x, point.y, point.z, 1.0)
        let transformedVector = transform * vector
        return simd_float3(transformedVector.x, transformedVector.y, transformedVector.z)
    }

    func surfaceToCoords(surfaces: [CapturedRoom.Surface]) -> [[simd_float3]] {
      if #available(iOS 17.0, *) {
        let transformedPoints = surfaces.map { surface in
          var extendedCorners = surface.polygonCorners
          if extendedCorners.isEmpty {
              extendedCorners = [surface.dimensions * -0.5, surface.dimensions * 0.5]
          }
          return extendedCorners.map { transformPoint($0, using: surface.transform) }
        }
        return transformedPoints
      }
      return []
    }

    func objectToCoords(objects: [CapturedRoom.Object]) -> [[simd_float3]] {
      if #available(iOS 17.0, *) {
        let transformedPoints = objects.map { object in
          let extendedCorners = [object.dimensions * -0.5, object.dimensions * 0.5]
          return extendedCorners.map { transformPoint($0, using: object.transform) }
        }
        return transformedPoints
      }
      return []
    }

    func getTransformedRoom() -> [String: [[simd_float3]]] {
      if #available(iOS 17.0, *) {
        return [
          "floors": surfaceToCoords(surfaces: finalResults?.floors ?? []),
          "walls": surfaceToCoords(surfaces: finalResults?.walls ?? []),
          "doors": surfaceToCoords(surfaces: finalResults?.doors ?? []),
          "windows": surfaceToCoords(surfaces: finalResults?.windows ?? []),
          "openings": surfaceToCoords(surfaces: finalResults?.openings ?? []),
          "objects": objectToCoords(objects: finalResults?.objects ?? []),
        ]
      }
      return [:]
    }
}