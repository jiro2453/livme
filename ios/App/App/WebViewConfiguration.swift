import Foundation
import Capacitor

extension CAPBridgeViewController {
    open override func viewDidLoad() {
        super.viewDidLoad()

        // Disable WebView bounce/overscroll effect
        if let webView = self.webView {
            webView.scrollView.bounces = false
            webView.scrollView.alwaysBounceVertical = false
            webView.scrollView.alwaysBounceHorizontal = false
            webView.scrollView.contentInsetAdjustmentBehavior = .never
        }
    }
}
