import Foundation
import Capacitor
import WidgetKit

/// 웹(React) 쪽에서 이번 달 일정이 있는 날짜 목록을 App Group 공유 저장소에 넘기고,
/// 홈 화면 캘린더 위젯을 즉시 갱신시키기 위한 다리 역할.
///
/// 이 플러그인이 동작하려면 Xcode에서 App(메인 앱) 타겟과 위젯 익스텐션 타겟 모두에
/// 같은 App Group(예: group.com.example.calendar.app)을 추가해야 한다.
/// (Signing & Capabilities 탭 > + Capability > App Groups)
@objc(WidgetBridgePlugin)
public class WidgetBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetBridgePlugin"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setCalendarData", returnType: CAPPluginReturnPromise)
    ]

    static let appGroupId = "group.com.example.calendar.app"
    static let storageKey = "calendar_data_json"

    @objc func setCalendarData(_ call: CAPPluginCall) {
        guard let json = call.getString("json") else {
            call.reject("json is required")
            return
        }

        let defaults = UserDefaults(suiteName: WidgetBridgePlugin.appGroupId)
        defaults?.set(json, forKey: WidgetBridgePlugin.storageKey)

        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        call.resolve()
    }
}
