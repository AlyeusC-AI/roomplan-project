import UIKit
import Foundation
import RoomPlan
import React
import ReactBridge

let logger = Logger(subsystem: "com.servicegeek.servicegeekmobile", category: "Lidar Scan")

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

    private var isScanning: Bool = false

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

        self.addSubview(roomCaptureView)

        startSession()
    }

    public func startSession() {
        logger.info("[RoomCapture] Starting capture session")
        isScanning = true
        roomCaptureView?.captureSession.run(configuration: roomCaptureSessionConfig)
    }
    
    public func stopSession() {
        logger.info("[RoomCapture] Stopping capture session")
        isScanning = false
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
        do {
            try FileManager.default.createDirectory(at: destinationFolderURL, withIntermediateDirectories: true)
            let jsonEncoder = JSONEncoder()
            let jsonData = try jsonEncoder.encode(finalResults)
            try jsonData.write(to: capturedRoomURL)
            try finalResults?.export(to: destinationURL, exportOptions: .parametric)
            
            logger.info("[RoomCapture] Successfully processed room \(destinationURL)")
        } catch {
            print("Error = \(error)")
        }
    }
}