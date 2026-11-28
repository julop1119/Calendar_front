package com.example.calendar.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.HashSet;
import java.util.Set;

/** 6행 7열 월간 달력 모양 홈 화면 위젯. 오늘은 원형 배경, 일정 있는 날은 빨간 글자로 표시. */
public class CalendarWidgetProvider extends AppWidgetProvider {

    private static final int[] CELL_IDS = {
        R.id.cell_0, R.id.cell_1, R.id.cell_2, R.id.cell_3, R.id.cell_4, R.id.cell_5, R.id.cell_6,
        R.id.cell_7, R.id.cell_8, R.id.cell_9, R.id.cell_10, R.id.cell_11, R.id.cell_12, R.id.cell_13,
        R.id.cell_14, R.id.cell_15, R.id.cell_16, R.id.cell_17, R.id.cell_18, R.id.cell_19, R.id.cell_20,
        R.id.cell_21, R.id.cell_22, R.id.cell_23, R.id.cell_24, R.id.cell_25, R.id.cell_26, R.id.cell_27,
        R.id.cell_28, R.id.cell_29, R.id.cell_30, R.id.cell_31, R.id.cell_32, R.id.cell_33, R.id.cell_34,
        R.id.cell_35, R.id.cell_36, R.id.cell_37, R.id.cell_38, R.id.cell_39, R.id.cell_40, R.id.cell_41,
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        updateWidgets(context, appWidgetManager, appWidgetIds);
    }

    public static void updateWidgets(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        RemoteViews views = buildRemoteViews(context);
        for (int id : appWidgetIds) {
            appWidgetManager.updateAppWidget(id, views);
        }
    }

    private static RemoteViews buildRemoteViews(Context context) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.calendar_widget);

        Calendar today = Calendar.getInstance();
        int todayYear = today.get(Calendar.YEAR);
        int todayMonth = today.get(Calendar.MONTH) + 1;
        int todayDay = today.get(Calendar.DAY_OF_MONTH);

        int dataYear = todayYear;
        int dataMonth = todayMonth;
        Set<Integer> eventDays = new HashSet<>();

        SharedPreferences prefs = context.getSharedPreferences(WidgetBridgePlugin.PREFS_NAME, Context.MODE_PRIVATE);
        String json = prefs.getString(WidgetBridgePlugin.KEY_DATA, null);
        if (json != null) {
            try {
                JSONObject obj = new JSONObject(json);
                dataYear = obj.getInt("year");
                dataMonth = obj.getInt("month");
                JSONArray days = obj.getJSONArray("eventDays");
                for (int i = 0; i < days.length(); i++) {
                    eventDays.add(days.getInt(i));
                }
            } catch (Exception ignored) {
                // 저장된 데이터가 없거나 손상된 경우: 그냥 숫자 달력만 보여준다.
            }
        }

        views.setTextViewText(R.id.widget_month_label, dataYear + "." + dataMonth);

        Calendar cal = Calendar.getInstance();
        cal.set(dataYear, dataMonth - 1, 1);
        int firstDayOfWeek = cal.get(Calendar.DAY_OF_WEEK) - 1; // Calendar.SUNDAY=1 -> 0
        int daysInMonth = cal.getActualMaximum(Calendar.DAY_OF_MONTH);
        boolean isCurrentMonth = dataYear == todayYear && dataMonth == todayMonth;

        for (int i = 0; i < CELL_IDS.length; i++) {
            int cellId = CELL_IDS[i];
            int day = i - firstDayOfWeek + 1;

            if (day < 1 || day > daysInMonth) {
                views.setTextViewText(cellId, "");
                views.setInt(cellId, "setBackgroundColor", Color.TRANSPARENT);
                continue;
            }

            views.setTextViewText(cellId, String.valueOf(day));

            boolean isToday = isCurrentMonth && day == todayDay;
            if (isToday) {
                views.setInt(cellId, "setBackgroundResource", R.drawable.widget_today_circle);
                views.setTextColor(cellId, Color.WHITE);
            } else {
                views.setInt(cellId, "setBackgroundColor", Color.TRANSPARENT);
                boolean hasEvent = eventDays.contains(day);
                views.setTextColor(cellId, hasEvent ? Color.parseColor("#EF4444") : Color.parseColor("#374151"));
            }
        }

        return views;
    }
}
