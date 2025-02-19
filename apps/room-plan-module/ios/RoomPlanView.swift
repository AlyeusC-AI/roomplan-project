import ExpoModulesCore
import WebKit

class RoomPlanView: ExpoView {
  let webView = WKWebView()
  let onUrl = EventDispatcher()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    addSubview(webView)

    let url =  URL(string:"https://docs.expo.dev/modules/")!
    let urlRequest = URLRequest(url:url)
    webView.load(urlRequest)
  }

  override func layoutSubviews() {
    webView.frame = bounds
  }

  func onComplete(url: URL) {
    onUrl([
      "url": url.absoluteString
    ])
  } 
}
