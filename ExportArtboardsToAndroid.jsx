/**
* Author: austynmahoney (https://github.com/austynmahoney)
* 
* Copyright 2016 Austyn Mahoney
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
var selectedExportOptions = {};

var androidExportOptions = [
{
        name: "ldpi",
        scaleFactor: 120/160,
        type: "android"
    },
    {
        name: "mdpi",
        scaleFactor: 160/160,
        type: "android"
    },
    {
        name: "hdpi",
        scaleFactor: 240/160,
        type: "android"
    },
    {
        name: "xhdpi",
        scaleFactor: 320/160,
        type: "android"
    },
    {
        name: "xxhdpi",
        scaleFactor: 480/160,
        type: "android"
    },
    {
        name: "xxxhdpi",
        scaleFactor: 640/160,
        type: "android"
    }
];

var iosExportOptions = [
    {
        name: "@1x",
        scaleFactor: 50,
        type: "ios"
    },
    {
        name: "@2x",
        scaleFactor: 100,
        type: "ios"
    },
    {
        name: "@3x",
        scaleFactor: 150,
        type: "ios"
    }
];

var folder = Folder.selectDialog("Select export directory");
var document = app.activeDocument;

if(document && folder) {
    var dialog = new Window("dialog","Select export sizes");
    var osGroup = dialog.add("group");
	
	var panel = dialog.add('panel', undefined, 'Resize');
	var group = panel.add("group");
	group.add("statictext", undefined, "Width:")
	var editWidth = group.add('edittext', undefined, '');
	editWidth.characters = 7;
	group = panel.add("group");
	group.add("statictext", undefined, "Height:")
	var editHeight = group.add('edittext', undefined, '');
	editHeight.characters = 7;

    var androidCheckboxes = createSelectionPanel("Android", androidExportOptions, osGroup);
    var iosCheckboxes = createSelectionPanel("iOS", iosExportOptions, osGroup);

    var buttonGroup = dialog.add("group");
    var okButton = buttonGroup.add("button", undefined, "Export");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    
    okButton.onClick = function() {
        for (var key in selectedExportOptions) {
            if (selectedExportOptions.hasOwnProperty(key)) {
                var item = selectedExportOptions[key];
				if(!editHeight.text && !editWidth.text) {
					exportToFile(item.scaleFactor, item.scaleFactor, item.name, item.type);
				} else if(editHeight.text && !editWidth.text) {
					var vs = Number(editHeight.text)/document.height;
					exportToFile(item.scaleFactor*vs, item.scaleFactor*vs, item.name, item.type);
				} else if(!editHeight.text && editWidth.text) {
					var hs = Number(editWidth.text)/document.width;
					exportToFile(item.scaleFactor*hs, item.scaleFactor*hs, item.name, item.type);
				} else if(editHeight.text && editWidth.text) {
					var hs = Number(editWidth.text)/document.width;
					var vs = Number(editHeight.text)/document.height;
					exportToFile(item.scaleFactor*hs, item.scaleFactor*vs, item.name, item.type);
				} else {
				}
            }
        }
        this.parent.parent.close();
    };
    
    cancelButton.onClick = function () {
        this.parent.parent.close();
    };

    dialog.show();
}

function exportToFile(scaleFactorHorizontal, scaleFactorVertical, resIdentifier, os) {
    var i, ab, file, options, expFolder;
    if(os === "android")
        expFolder = new Folder(folder.fsName + "/drawable-" + resIdentifier);
    else if(os === "ios")
        expFolder = new Folder(folder.fsName + "/iOS");

	if (!expFolder.exists) {
		expFolder.create();
	}

	for (i = document.artboards.length - 1; i >= 0; i--) {
		document.artboards.setActiveArtboardIndex(i);
		ab = document.artboards[i];
		
	if(ab.name.charAt(0)=="!")
            continue;
        
		var dot = document.name.lastIndexOf('.');
		var prefix = document.name.substring(0, dot);
		prefix = prefix.replace(/ /g, "_");
		prefix += '_';
		
        if(os === "android")
            file = new File(expFolder.fsName + "/" + prefix + ab.name.replace(/ /g, "_") + ".png");
        else if(os === "ios")
            file = new File(expFolder.fsName + "/" + prefix + resIdentifier + ".png");
            
            options = new ExportOptionsPNG24();
            options.transparency = true;
            options.artBoardClipping = true;
            options.antiAliasing = true;
            options.verticalScale = scaleFactorVertical * 100.0;
            options.horizontalScale = scaleFactorHorizontal * 100.0;

            document.exportFile(file, ExportType.PNG24, options);
	}
};

function createSelectionPanel(name, array, parent) {
    var panel = parent.add("panel", undefined, name);
    panel.alignChildren = "left";
    for(var i = 0; i < array.length;  i++) {
        var cb = panel.add("checkbox", undefined, "\u00A0" + array[i].name);
        cb.item = array[i];
        cb.onClick = function() {
            if(this.value) {
                selectedExportOptions[this.item.name] = this.item;
                //alert("added " + this.item.name);
            } else {
                delete selectedExportOptions[this.item.name];
                //alert("deleted " + this.item.name);
            }
        };
    }
};