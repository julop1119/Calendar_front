package com.example.calendar.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * 웹(React) 쪽에서 이번 달 일정이 있는 날짜 목록을 저장소에 넘기고,
 * 홈 화면 캘린더 위젯을 즉시 갱신시키기 위한 다리 역할.
 */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    public static final String PREFS_NAME = "calendar_widget_prefs";
    public static final String KEY_DATA = "calendar_data_json";

    @PluginMethod
    public void setCalendarData(PluginCall call) {
        String json = call.getString("json");
        if (json == null) {
            call.reject("json is required");
            return;
        }

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_DATA, json).apply();

        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, CalendarWidgetProvider.class);
        int[] widgetIds = manager.getAppWidgetIds(component);
        if (widgetIds.length > 0) {
            CalendarWidgetProvider.updateWidgets(context, manager, widgetIds);
        }

        call.resolve(new JSObject());
    }
}
