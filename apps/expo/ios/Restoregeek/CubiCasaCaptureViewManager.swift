//
//  ContentView.swift
//  CubiCaptureDemo
//

import SwiftUI
import CubiCapture
import React
import ReactBridge

let coordinator = ScanCoordinator()
let fileName = "Room"

@ReactView
class CubiCasaScanView: RCTViewManager {
    override func view() -> UIView! {
        let view = CubiView(frame: UIScreen.main.bounds)
        return view
    }

    @ReactProperty
    var onCaptureCompleted: RCTBubblingEventBlock?

    @ReactProperty
    var onCaptureError: RCTBubblingEventBlock?
}


class CubiView: RCTView {
    private let address: CubiCaptureAddress = CubiCaptureAddress(street: "Place", city: "Holder", country: "Land")
    private let customColorSet = ColorSet (
        accent: .white,
        text: .white,
        buttonText: .black,
        background: .black,
        warning: .orange,
        warningBorder: [.orange, .yellow],
        info: .black,
        infoBorder: [.blue, .gray],
        record: .red
    )

    @objc var onCaptureCompleted: RCTBubblingEventBlock?
    @objc var onCaptureError: RCTBubblingEventBlock?

    override init(frame: CGRect) {
        super.init(frame: frame)
        self.isUserInteractionEnabled = true
        self.superview?.isUserInteractionEnabled = true
        self.superview?.clipsToBounds = false
        setupRoomCapture()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        self.isUserInteractionEnabled = true
        self.superview?.isUserInteractionEnabled = true
        self.superview?.clipsToBounds = false
        setupRoomCapture()
    }

    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let hitView = super.hitTest(point, with: event)
        print("Touched view: \(String(describing: hitView))")
        return hitView
    }

    private func setupRoomCapture() {
        let windowScene = UIApplication.shared.connectedScenes.first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene
        let window = windowScene?.windows.first(where: { $0.isKeyWindow })

        let safeAreaInsets = window?.safeAreaInsets
        let safeAreaHeight = self.frame.height - (safeAreaInsets?.top ?? 0) - (safeAreaInsets?.bottom ?? 0)

        coordinator.completion = self.handleResult(result:)

        let cubiView = CubiCaptureView(
            delegate: coordinator,
            fileName: fileName,
            address: address,
            propertyType: .other,
            usesRawDepth: false,
            options: .defaultOptions,
            colorSet: customColorSet
        ).frame(width: self.frame.width, height: safeAreaHeight)

        let hostingController = UIHostingController(rootView: cubiView)
        guard let hostingView = hostingController.view else { return }
        hostingView.translatesAutoresizingMaskIntoConstraints = false

        self.addSubview(hostingView)
    }

    private func handleResult(result: Result<URL, CaptureError>) {
        switch result {
        case .success(let url):
            print("Scan success: \(url)")
            let url = getUrl()
            self.onCaptureCompleted?(["url": url?.absoluteString])
        case .failure(let error):
            // Don't show an error alert in case of user cancel
            if case .userCancel = error {
                self.onCaptureCompleted?(["url": "user-cancel"])
                return
            }
            let message = "Scan failed: \(error.localizedDescription)"
            print(message)
            self.onCaptureError?(["message": ""])
        }
    }

    private func getUrl() -> URL? {
        let fm = FileManager.default
        guard !fileName.isEmpty,
              let documentDirectory = fm.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return nil
        }

        let projectLocation = documentDirectory.appendingPathComponent(fileName)
        guard let zipFile = try? fm.contentsOfDirectory(at: projectLocation, includingPropertiesForKeys: nil)
            .filter({ $0.absoluteString.contains(".zip")}).first
        else {
            return nil
        }

        return zipFile
    }
}