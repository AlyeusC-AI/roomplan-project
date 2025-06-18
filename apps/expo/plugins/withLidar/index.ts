import {
    withDangerousMod,
    withXcodeProject,
    IOSConfig,
    ConfigPlugin,
  } from "@expo/config-plugins";
  import fs from "fs";
  import build from "next/dist/build";
  import { NodeNextRequest } from "next/dist/server/base-http/node";
  import path from "path";
  
  const SWIFT_FILE = "RoomCaptureViewManager.swift";
  const HEADER_FILE = "Restoregeek-Bridging-Header.h";
  
  const findFileReferenceByName = (xcodeProject: any, fileName: any) => {
    const fileReferences = xcodeProject.hash.project.objects['PBXFileReference']
  
    return Object.fromEntries(
      Object
        .entries(fileReferences)
        .filter(([key, value]) => (value as any).name === `"${fileName}"`)
    )
  }
  
  const withLidar: ConfigPlugin = (config) => {
    config = withSwiftFiles(config);
    config = withXcodeProjectMod(config);
    return config;
  };
  
  // Step 1: Copy Swift and Header files into ios/Restoregeek/
  const withSwiftFiles: ConfigPlugin = (config) => {
    return withDangerousMod(config, [
      "ios",
      async (config) => {
        const iosTargetPath = path.join(
          config.modRequest.platformProjectRoot,
          config.modRequest.projectName!
        );
        const pluginSourcePath = __dirname;
  
        fs.copyFileSync(
          path.join(pluginSourcePath, SWIFT_FILE),
          path.join(iosTargetPath, SWIFT_FILE)
        );
  
        fs.copyFileSync(
          path.join(pluginSourcePath, HEADER_FILE),
          path.join(iosTargetPath, HEADER_FILE)
        );
  
        return config;
      },
    ]);
  };
  
  // Step 2: Modify Xcode project to include files + bridging header
  const withXcodeProjectMod: ConfigPlugin = (config) => {
    return withXcodeProject(config, (config) => {
      const project = config.modResults;
      project.pbxCreateGroup("Resources");
      const projectName = config.modRequest.projectName!;
  
      const swiftFile = path.join(projectName, SWIFT_FILE);
      const headerFile = path.join(projectName, HEADER_FILE);
  
      // Ensure group exists or create it
      const groupName = config.modRequest.projectName!;
      const groupKey = project.findPBXGroupKey({ name: groupName }) ?? project.pbxCreateGroup(groupName, projectName);
  
      // Ensure the Swift file exists
      if (!fs.existsSync(path.join(config.modRequest.platformProjectRoot, swiftFile))) {
        throw new Error(`${swiftFile} does not exist`);
      }
  
      // Add the file to the project under the correct group
      if (!project.hasFile(swiftFile)) {
        console.log("Adding Swift source file:", swiftFile);
        project.addSourceFile(swiftFile, {}, groupKey); // correct usage
      }
  
      if (!project.hasFile(headerFile)) {
        project.addHeaderFile(headerFile);
      }
  
      const nativeTarget = project.getFirstTarget().uuid;
      const applyToAllBuildConfigs = (
        sectionName: string,
        modifier: (buildSettings: any, entryName: any) => void
      ) => {
        const section = project.pbxXCBuildConfigurationSection();
        for (const key in section) {
          const entry = section[key];
          if (typeof entry === 'object' && entry.buildSettings && entry.name) {
            if (sectionName === 'PBXNativeTarget' && ['Debug', 'Release'].includes(entry.name)) {
              modifier(entry.buildSettings, entry.name);
            } else if (sectionName === 'PBXProject' && ['Debug', 'Release'].includes(entry.name)) {
              modifier(entry.buildSettings, entry.name);
            }
          }
        }
      };
  
      // ✅ Native Target-level settings (Restoregeek)
      applyToAllBuildConfigs('PBXNativeTarget', (buildSettings, entryName) => {
        if (!buildSettings['ASSETCATALOG_COMPILER_APPICON_NAME']) return;
        if (!buildSettings['OTHER_SWIFT_FLAGS']) {
          const mode = entryName === 'Debug' ? 'DEBUG' : 'RELEASE';
          buildSettings['OTHER_SWIFT_FLAGS'] = `"$(inherited) -D EXPO_CONFIGURATION_${mode}"`;
        }
  
        if (buildSettings['SWIFT_OBJC_BRIDGING_HEADER']) {
          buildSettings['SWIFT_OBJC_BRIDGING_HEADER'] = '"Restoregeek/Restoregeek-Bridging-Header.h"';
        }
      });
  
      // ✅ Project-level settings
      applyToAllBuildConfigs('PBXProject', (buildSettings, entryName) => {
        if (buildSettings['ASSETCATALOG_COMPILER_APPICON_NAME']) return;
        if (entryName === 'Debug') {
          buildSettings['SWIFT_ACTIVE_COMPILATION_CONDITIONS'] = '"$(inherited) DEBUG"';
        }
        buildSettings['OTHER_LDFLAGS'] = '"$(inherited)  "';
        buildSettings['REACT_NATIVE_PATH'] = '"${PODS_ROOT}/../../../../node_modules/react-native"';
        buildSettings['USE_HERMES'] = true;
        //Replace
        buildSettings['LIBRARY_SEARCH_PATHS'] = [
          '"$(SDKROOT)/usr/lib/swift"',
          '"$(inherited)"',
        ];
      });
  
      /** Add SPM dependency, ReactBridge */
      const version = "1.4.1"
      const repositoryUrl = "https://github.com/ikhvorost/ReactBridge.git"
      const repoName = "ReactBridge"
      const productName = "ReactBridge"
      const xcodeProject = config.modResults
  
      // update XCRemoteSwiftPackageReference
      const spmReferences = project.hash.project.objects['XCRemoteSwiftPackageReference']
  
      if (!spmReferences) {
        project.hash.project.objects['XCRemoteSwiftPackageReference'] = {}
      }
  
      const packageReferenceUUID = project.generateUuid()
  
      project.hash.project.objects['XCRemoteSwiftPackageReference'][`${packageReferenceUUID} /* XCRemoteSwiftPackageReference "${repoName}" */`] = {
        isa: 'XCRemoteSwiftPackageReference',
        repositoryURL: repositoryUrl,
        requirement: {
          kind: 'upToNextMajorVersion',
          minimumVersion: version
        }
      }
  
      // update XCSwiftPackageProductDependency
      const spmProducts = project.hash.project.objects['XCSwiftPackageProductDependency']
  
      if (!spmProducts) {
        project.hash.project.objects['XCSwiftPackageProductDependency'] = {}
      }
  
      const packageUUID = project.generateUuid()
  
      project.hash.project.objects['XCSwiftPackageProductDependency'][`${packageUUID} /* ${productName} */`] = {
        isa: 'XCSwiftPackageProductDependency',
        // from step before
        package: `${packageReferenceUUID} /* XCRemoteSwiftPackageReference "${repoName}" */`,
        productName: productName
      }
  
      // update PBXProject
      const projectId = Object.keys(project.hash.project.objects['PBXProject']).at(0)
  
      if (!project.hash.project.objects['PBXProject'][projectId]['packageReferences']) {
        project.hash.project.objects['PBXProject'][projectId]['packageReferences'] = []
      }
  
      project.hash.project.objects['PBXProject'][projectId]['packageReferences'] = [
        ...project.hash.project.objects['PBXProject'][projectId]['packageReferences'],
        `${packageReferenceUUID} /* XCRemoteSwiftPackageReference "${repoName}" */`,
      ]
  
      // update PBXBuildFile
      const frameworkUUID = project.generateUuid()
  
      project.hash.project.objects['PBXBuildFile'][`${frameworkUUID}_comment`] = `${productName} in Frameworks`
      project.hash.project.objects['PBXBuildFile'][frameworkUUID] = {
        isa: 'PBXBuildFile',
        productRef: packageUUID,
        productRef_comment: productName
      }
  
      // update PBXFrameworksBuildPhase
      const buildPhaseId = Object.keys(project.hash.project.objects['PBXFrameworksBuildPhase']).at(0)
  
      if (!project.hash.project.objects['PBXFrameworksBuildPhase'][buildPhaseId]['files']) {
        project.hash.project.objects['PBXFrameworksBuildPhase'][buildPhaseId]['files'] = []
      }
  
      project.hash.project.objects['PBXFrameworksBuildPhase'][buildPhaseId]['files'] = [
        ...project.hash.project.objects['PBXFrameworksBuildPhase'][buildPhaseId]['files'],
        `${frameworkUUID} /* ${productName} in Frameworks */`,
      ]
  
      // 1. [Expo] Configure project
      const configurePhaseId = project.generateUuid();
      project.hash.project.objects['PBXShellScriptBuildPhase'][configurePhaseId] = {
        isa: 'PBXShellScriptBuildPhase',
        alwaysOutOfDate: 1,
        buildActionMask: 2147483647,
        files: [],
        inputFileListPaths: [],
        inputPaths: [],
        name: '"[Expo] Configure project"',
        outputFileListPaths: [],
        outputPaths: [],
        runOnlyForDeploymentPostprocessing: 0,
        shellPath: '/bin/sh',
        shellScript:
          '"# This script configures Expo modules and generates the modules provider file.\\nbash -l -c \\"./Pods/Target\\\\ Support\\\\ Files/Pods-Restoregeek/expo-configure-project.sh\\"\\n"',
      };
  
      // 2. [CP] Embed Pods Frameworks
      const embedPodsPhaseId = project.generateUuid();
      project.hash.project.objects['PBXShellScriptBuildPhase'][embedPodsPhaseId] = {
        isa: 'PBXShellScriptBuildPhase',
        buildActionMask: 2147483647,
        files: [],
        inputPaths: [
          '"${PODS_ROOT}/Target Support Files/Pods-Restoregeek/Pods-Restoregeek-frameworks.sh"',
          '"${PODS_XCFRAMEWORKS_BUILD_DIR}/hermes-engine/Pre-built/hermes.framework/hermes"',
        ],
        name: '"[CP] Embed Pods Frameworks"',
        outputPaths: [
          '"${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}/hermes.framework"',
        ],
        runOnlyForDeploymentPostprocessing: 0,
        shellPath: '/bin/sh',
        shellScript:
          '"\\"${PODS_ROOT}/Target Support Files/Pods-Restoregeek/Pods-Restoregeek-frameworks.sh\\""',
        showEnvVarsInLog: 0,
      };
  
      // Insert into buildPhases
      // const nativeTarget = project.getFirstTarget().uuid;
      const buildPhases = project.pbxNativeTargetSection()[nativeTarget].buildPhases;
  
      buildPhases.splice(1, 0, {
        value: configurePhaseId,
        comment: '[Expo] Configure project',
      });
  
      buildPhases.push({
        value: embedPodsPhaseId,
        comment: '[CP] Embed Pods Frameworks',
      });
  
      return config;
    });
  };
  
  export default withLidar;
  