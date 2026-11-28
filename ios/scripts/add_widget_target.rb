#!/usr/bin/env ruby
# Xcode GUI 없이 CalendarWidgetExtension(WidgetKit) 타겟을 App.xcodeproj에 추가한다.
# CI(macOS 러너)에서 컴파일 확인용으로 실행하거나, 필요하면 로컬 Mac에서 직접 실행해도 된다.
#
#   gem install xcodeproj
#   ruby ios/scripts/add_widget_target.rb
#
# 이미 타겟이 있으면 아무것도 하지 않는다(여러 번 실행해도 안전).

require 'xcodeproj'

IOS_DIR = File.expand_path('..', __dir__)
PROJECT_PATH = File.join(IOS_DIR, 'App', 'App.xcodeproj')
WIDGET_TARGET_NAME = 'CalendarWidgetExtension'
BUNDLE_ID = 'com.example.calendar.app.CalendarWidgetExtension'
DEPLOYMENT_TARGET = '16.0'

project = Xcodeproj::Project.open(PROJECT_PATH)

if project.targets.any? { |t| t.name == WIDGET_TARGET_NAME }
  puts "#{WIDGET_TARGET_NAME} already exists, nothing to do."
  exit 0
end

app_target = project.targets.find { |t| t.name == 'App' }
raise "App target not found in #{PROJECT_PATH}" unless app_target

widget_target = project.new_target(:app_extension, WIDGET_TARGET_NAME, :ios, DEPLOYMENT_TARGET)

group = project.main_group.find_subpath(WIDGET_TARGET_NAME, true)
group.set_source_tree('<group>')
widget_dir = File.join(IOS_DIR, 'App', WIDGET_TARGET_NAME)

swift_ref = group.new_reference(File.join(widget_dir, 'CalendarWidget.swift'))
widget_target.add_file_references([swift_ref])
group.new_reference(File.join(widget_dir, 'Info.plist'))
group.new_reference(File.join(widget_dir, "#{WIDGET_TARGET_NAME}.entitlements"))

widget_target.build_configurations.each do |config|
  config.build_settings['INFOPLIST_FILE'] = "#{WIDGET_TARGET_NAME}/Info.plist"
  config.build_settings['PRODUCT_NAME'] = '$(TARGET_NAME)'
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = BUNDLE_ID
  config.build_settings['SWIFT_VERSION'] = '5.0'
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = DEPLOYMENT_TARGET
  config.build_settings['TARGETED_DEVICE_FAMILY'] = '1,2'
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] = "#{WIDGET_TARGET_NAME}/#{WIDGET_TARGET_NAME}.entitlements"
  config.build_settings['CODE_SIGN_STYLE'] = 'Automatic'
  config.build_settings['SKIP_INSTALL'] = 'YES'
  config.build_settings['GENERATE_INFOPLIST_FILE'] = 'NO'
end

%w[WidgetKit.framework SwiftUI.framework].each do |framework_name|
  framework_ref = project.frameworks_group.new_reference("System/Library/Frameworks/#{framework_name}")
  framework_ref.source_tree = 'SDKROOT'
  widget_target.frameworks_build_phase.add_file_reference(framework_ref)
end

app_target.build_configurations.each do |config|
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] ||= 'App/App.entitlements'
end

app_target.add_dependency(widget_target)

embed_phase = app_target.copy_files_build_phases.find { |p| p.name == 'Embed Foundation Extensions' } ||
              app_target.copy_files_build_phases.find { |p| p.name == 'Embed App Extensions' } ||
              app_target.new_copy_files_build_phase('Embed Foundation Extensions')
embed_phase.symbol_dst_subfolder_spec = :plug_ins

build_file = embed_phase.add_file_reference(widget_target.product_reference)
build_file.settings = { 'ATTRIBUTES' => ['RemoveHeaderOnCopy'] }

project.save
puts "Added #{WIDGET_TARGET_NAME} target to #{PROJECT_PATH}"
