// 참고용 코드입니다. 아직 Xcode 프로젝트의 실제 타겟으로 연결되어 있지 않습니다.
//
// Mac + Xcode에서 하실 일:
// 1. App.xcworkspace를 열고 File > New > Target... > Widget Extension 선택
//    (이름: CalendarWidget, "Include Configuration Intent" 체크 해제)
// 2. Xcode가 만들어준 기본 Swift 파일 내용을 이 파일 내용으로 교체
// 3. 메인 앱(App) 타겟과 새로 만든 CalendarWidget 타겟 모두
//    Signing & Capabilities 탭에서 "App Groups" capability 추가, 동일한 그룹 ID 사용
//    (예: group.com.example.calendar.app — WidgetBridgePlugin.swift와 동일해야 함)
// 4. 빌드/실행해서 홈 화면에 위젯 추가 테스트

import WidgetKit
import SwiftUI

struct CalendarEntry: TimelineEntry {
    let date: Date
    let year: Int
    let month: Int
    let eventDays: Set<Int>
}

struct CalendarProvider: TimelineProvider {
    // WidgetBridgePlugin.swift의 appGroupId와 반드시 동일해야 한다.
    static let appGroupId = "group.com.example.calendar.app"
    static let storageKey = "calendar_data_json"

    func placeholder(in context: Context) -> CalendarEntry {
        makeEntry()
    }

    func getSnapshot(in context: Context, completion: @escaping (CalendarEntry) -> Void) {
        completion(makeEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CalendarEntry>) -> Void) {
        let entry = makeEntry()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date()
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }

    private func makeEntry() -> CalendarEntry {
        let now = Date()
        let cal = Calendar.current
        var year = cal.component(.year, from: now)
        var month = cal.component(.month, from: now)
        var eventDays: Set<Int> = []

        if let defaults = UserDefaults(suiteName: Self.appGroupId),
           let json = defaults.string(forKey: Self.storageKey),
           let data = json.data(using: .utf8),
           let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            year = obj["year"] as? Int ?? year
            month = obj["month"] as? Int ?? month
            if let days = obj["eventDays"] as? [Int] {
                eventDays = Set(days)
            }
        }

        return CalendarEntry(date: now, year: year, month: month, eventDays: eventDays)
    }
}

struct CalendarWidgetEntryView: View {
    var entry: CalendarEntry

    private var daysInMonth: Int {
        var comps = DateComponents()
        comps.year = entry.year
        comps.month = entry.month
        let cal = Calendar.current
        guard let date = cal.date(from: comps), let range = cal.range(of: .day, in: .month, for: date) else {
            return 30
        }
        return range.count
    }

    private var firstWeekday: Int {
        var comps = DateComponents()
        comps.year = entry.year
        comps.month = entry.month
        comps.day = 1
        let cal = Calendar.current
        guard let date = cal.date(from: comps) else { return 0 }
        return cal.component(.weekday, from: date) - 1 // 일요일=1 -> 0
    }

    private var isCurrentMonth: Bool {
        let cal = Calendar.current
        let now = Date()
        return cal.component(.year, from: now) == entry.year && cal.component(.month, from: now) == entry.month
    }

    private var todayDay: Int {
        Calendar.current.component(.day, from: Date())
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("\(entry.year).\(entry.month)")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(Color(red: 0.07, green: 0.09, blue: 0.15))

            VStack(spacing: 2) {
                ForEach(0..<6, id: \.self) { row in
                    HStack(spacing: 2) {
                        ForEach(0..<7, id: \.self) { col in
                            dayCell(day: row * 7 + col - firstWeekday + 1)
                        }
                    }
                }
            }
        }
        .padding(8)
    }

    @ViewBuilder
    private func dayCell(day: Int) -> some View {
        if day < 1 || day > daysInMonth {
            Text("")
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
            let isToday = isCurrentMonth && day == todayDay
            let hasEvent = entry.eventDays.contains(day)
            Text("\(day)")
                .font(.system(size: 11))
                .foregroundColor(
                    isToday ? .white : (hasEvent ? Color(red: 0.94, green: 0.27, blue: 0.27) : Color(red: 0.22, green: 0.25, blue: 0.32))
                )
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(isToday ? Color(red: 0.15, green: 0.39, blue: 0.92) : Color.clear)
                .clipShape(Circle())
        }
    }
}

struct CalendarWidget: Widget {
    let kind: String = "CalendarWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CalendarProvider()) { entry in
            CalendarWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("캘린더")
        .description("이번 달 일정이 있는 날을 보여줘요")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

@main
struct CalendarWidgetBundle: WidgetBundle {
    var body: some Widget {
        CalendarWidget()
    }
}
