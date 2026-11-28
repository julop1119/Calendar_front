package com.example.calendar.app;

import android.os.Bundle;

import androidx.core.view.WindowCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridgePlugin.class);
        super.onCreate(savedInstanceState);
        // targetSdk 35+에서 기본으로 켜지는 엣지투엣지를 끈다.
        // (시스템 내비게이션 바에 앱 UI가 겹치는 문제 방지)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
