import { reportSettingsStore } from "@atoms/report-settings";
import { Switch } from "@headlessui/react";
import { useState } from "react";

const ReportSettingsPanel = () => {
  const {
    showTitlePage,
    showWeatherReporting,
    showDimensionsAndDetails,
    showOverviewPhotos,
    showReadings,
    showNotes,
    showAffectedAreas,
    toggleTitlePage,
    toggleWeatherReporting,
    toggleDimensionsAndDetails,
    toggleOverviewPhotos,
    toggleReadings,
    toggleNotes,
    toggleAffectedAreas,
  } = reportSettingsStore();

  const [isOpen, setIsOpen] = useState(false);

  const settings = [
    { name: "Title Page", value: showTitlePage, toggle: toggleTitlePage },
    // { name: "Weather Reporting", value: showWeatherReporting, toggle: toggleWeatherReporting },
    { name: "Dimensions & Details", value: showDimensionsAndDetails, toggle: toggleDimensionsAndDetails },
    { name: "Overview Photos", value: showOverviewPhotos, toggle: toggleOverviewPhotos },
    { name: "Readings", value: showReadings, toggle: toggleReadings },
    { name: "Notes", value: showNotes, toggle: toggleNotes },
    { name: "Affected Areas", value: showAffectedAreas, toggle: toggleAffectedAreas },
  ];

  return (
    <div className="">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
      >
        {isOpen ? "Close Settings" : "Report Settings"}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Report Sections</h3>
          <div className="space-y-3">
            {settings.map((setting) => (
              <div key={setting.name} className="flex items-center justify-between">
                <span className="text-gray-700">{setting.name}</span>
                <Switch
                  checked={setting.value}
                  onChange={setting.toggle}
                  className={`${
                    setting.value ? "bg-blue-600" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      setting.value ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportSettingsPanel; 