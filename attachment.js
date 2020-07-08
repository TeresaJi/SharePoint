//文件上传初始化
$(function () {
    $("#files").kendoUpload({
        template: $("#fileTemplate").html(),
        async: {
            saveUrl: _spPageContextInfo.webAbsoluteUrl + "/save",
            removeUrl: _spPageContextInfo.webAbsoluteUrl + "/remove",
            autoUpload: false
        },
        //将文件转化成二进制数放到容器并传给服务器
        upload: onUpload,
        validation: {
            allowedExtensions: allowedExtensionsArray,
            maxFileSize: filemaxsize,
            minFileSize: 0
        },
        success: onSuccess,
        error: onError,
        //检测文件是否合规
        select: onSelect
    });
    //如果页面设为隐藏，此处设置为显示
    $('#files').show();
})

//文件展示（初始化）
function showAttachments() {
    var attachments = getAttachmentFilesNew();
    if (attachments.length > 0) {
        var allfiles = [];
        var tempURL = attachments[0].FileURL;
        $('#attachementURL').val(tempURL.substring(0, tempURL.lastIndexOf('/')));
        for (var i = 0; i < attachments.length; i++) {
            var curfile = { name: "" + attachments[i].FileName + "" };
            allfiles.push(curfile);
        }
        $("#files").kendoUpload(
            {
                template: $("#fileTemplate2").html(),
                async:
                {
                    saveUrl: _spPageContextInfo.webAbsoluteUrl + "/save",
                    removeUrl: _spPageContextInfo.webAbsoluteUrl + "/remove"
                },
                files: allfiles,
                upload: onUpload,
                validation: {
                    allowedExtensions: allowedExtensionsArray,
                    maxFileSize: filemaxsize,
                    minFileSize: 0
                },
                success: onSuccess,
                error: onError,
                select: onSelect
            });
        $('#files').show();
    }
    else {
        $("#files").kendoUpload(
            {
                template: $("#fileTemplate").html(),
                async:
                {
                    saveUrl: _spPageContextInfo.webAbsoluteUrl + "/save",
                    removeUrl: _spPageContextInfo.webAbsoluteUrl + "/remove"
                },
                upload: onUpload,
                validation: {
                    allowedExtensions: allowedExtensionsArray,
                    maxFileSize: filemaxsize,
                    minFileSize: 0
                },
                success: onSuccess,
                error: onError,
                select: onSelect
            });
        $('#files').show();
    }
}


//声明全局变量
var allowedExtensionsArray = [".txt", ".zip", ".rar", ".7z", ".docx", ".doc", ".xlsx", ".xls", ".pdf", ".pptx", ".ppt", ".gif", ".jpg", ".png", ".mp4", ".msg"];
var filemaxsize = 22000000;
var mylistname = "PGGList";

//成功失败
function onSuccess() { }
function onError() { }

//选择
function onSelect(e) {
  $.each(e.files, function (i, filevalues) {
    filevalues.removefile = true;
    $.each(allowedExtensionsArray, function (i, allowedExtensionsArrayvalue) {
      if (~filevalues.extension.toLowerCase().indexOf(allowedExtensionsArrayvalue.toLowerCase())) {
        filevalues.removefile = false;
        return false;
      }
    });
  });
  $.each(e.files, function (index, value) {
    var bFileName = (function (fileName) {
      var re = /[@#\$%\^&\*\{\}\~\:\|\\\,\<\>\"\?]+/g;
      var flag = re.test(fileName);
      if (flag) {
        return true;
      } else {
        return false;
      }
    })(value.name);
    if (value.removefile) {
      setTimeout(function () {
        $("a[fileurl='" + decodeEntities(value.name) + "']").parent().remove();
      }, 1000);
      alert("Invalid file extension, '" + decodeEntities(value.name) + "' can not be uploaded.", {
        title: "Error",
        btn: "Close",
        icon: 2
      }, function () {
        layer.close(layer.alert());
      });
    }
    if (value.size > filemaxsize) {
      setTimeout(function () {
        $("a[fileurl='" + decodeEntities(value.name) + "']").parent().remove();
      }, 1000);
      layer.alert("Invalid file size(>20M), '" + decodeEntities(value.name) + "' can not be uploaded.", {
        title: "Error",
        btn: ["Close"],
        icon: 2
      }, function () {

        layer.close(layer.alert());
      });
    }
    if (value.size <= 0) {
      setTimeout(function () {
        $("a[fileurl='" + decodeEntities(value.name) + "']").parent().remove();
      }, 1000);
      layer.alert("Invalid file size(<0M), '" + decodeEntities(value.name) + "' can not be uploaded.", {
        title: "Error",
        btn: ["Close"],
        icon: 2
      }, function () {
        layer.close(layer.alert());
      });
    }
    if (bFileName) {
      setTimeout(function () {
        $("a[fileurl='" + decodeEntities(value.name) + "']").parent().remove();
      }, 1000);
      layer.alert("The uploaded file name contains illegal characters! '" + decodeEntities(value.name) + "' can not be uploaded.", {
        title: "Error",
        btn: ["Close"],
        icon: 2
      }, function () {
        layer.close(layer.alert());
      });
    }
  });
}

//上传
function onUpload(e) {
  var files = e.files;
  $.each(files, function (index, value) {
    var tempfile = this;
    var file = this.rawFile;
    var fileName = file.name;
    var getFileBuffer = function (file) {
      var deferred = $.Deferred();
      var reader = new FileReader();
      reader.onloadend = function (e) {
        deferred.resolve(e.target.result);
      };
      reader.onerror = function (e) {
        alert('onerror:' + e.target.error);
        deferred.reject(e.target.error);
      };
      reader.readAsArrayBuffer(file);
      return deferred.promise();
    };
    getFileBuffer(file).then(function (buffer) {
      var formID = $("#itemID").val();
      var bytes = new Uint8Array(buffer);
      var content = new SP.Base64EncodedByteArray();
      for (var i = 0; i < bytes.length; i++) {
        content.append(bytes[i]);
      }
      $().SPServices(
        {
          operation: "AddAttachment",
          listName: mylistname,
          async: false,
          listItemID: formID,
          fileName: fileName,
          attachment: content.toBase64String(),
          completefunc: function (xData, Status) {
            if (Status != 'success') {
              layer.alert('Submitted failed：upload file error!', {
                title: "Message",
                icon: 2,
                btn: ['Close']
              }, function () {
                layer.closeAll();
              })
            } else {
                
 			    var itemID = $("#itemID").val();
                setTimeout(function () {
                      window.location.href = _spPageContextInfo.webAbsoluteUrl + "/SitePages/PGG/pages/read.aspx?ItemID=" + itemID;
                }, 3000);

              layer.alert('Submitted successfully!', {
                title: "Message",
                icon: 1,
                btn: ['Close']
              }, function () {
                layer.closeAll();
                //跳转到read页面        	
                window.location.href = _spPageContextInfo.webAbsoluteUrl + "/SitePages/PGG/pages/read.aspx?ItemID=" + itemID;
              })
            }
          }
        });
    });
  });
}

//获取Attachment
function getAttachmentFilesNew(listItemId) {
  //获取当前url
  var URL = getUrlVars();

  //获取url中的id
  var itemID = URL.ItemID;

  var files = [];
  $().SPServices({
    operation: "GetAttachmentCollection",
    async: false,
    listName: 'PGGList',
    ID: itemID,
    completefunc: function (xData, Status) {
      var attachmentFileUrls = [];
      $(xData.responseXML).find("Attachment").each(function () {
        var url = $(this).text();
        var fileName = url.substring(url.lastIndexOf('/') + 1);
        var curFile = [];
        curFile.FileName = fileName;
        curFile.FileURL = url;
        files.push(curFile);
      });
    }
  });
  return files;
}

//下载
function downloadAttachment(obj) {
  var fileURL = $('#attachementURL').val() + "/" + $(obj).attr('fileurl');
  window.open(fileURL);
}

//删除
function delFile(obj) {
  if (window.confirm("Remove this file?")) {
    var fileURL = $('#attachementURL').val() + "/" + $(obj).attr('fileurl');
    if ($('#attachementURL').val()) {
      //deleteAttachement($("#mainDiv").data("formID"), fileURL);
      deleteAttachement($("#itemID").val(), fileURL);
      $(obj).parent().remove();
    } else {
      $(obj).parent().remove();
    }
    //$(obj).parent().remove();
  }
}
function deleteAttachement(itemID, fileURL) {
  $().SPServices({
    operation: "DeleteAttachment",
    listName: mylistname,
    listItemID: itemID,
    url: fileURL,
    async: false,
    completefunc: function (xData, Status) {
    }
  });
}

//备用
function uploadFileComplete() {
  var formid = $("#itemID").val();
  var formStatus = $("#demandStatus").val();
  if (formStatus == "Draft") {
    var result = "Form saved successfully!";
  } else if (formStatus == "Submitted") {
    var result = "Form submitted successfully!";
  }
  setTimeout(function () {
    //window.location.href = _spPageContextInfo.webAbsoluteUrl + "/SitePages/Task/pages/read.aspx?itemID=" + formid; //demand site的链接
  }, 2500);

  layer.alert(result, { title: "Message", btn: ["Close"], icon: 1 }, function () {
    //刷新页面
    //window.location.reload();
    //window.location.href = _spPageContextInfo.webAbsoluteUrl + "/SitePages/Task/pages/read.aspx?itemID=" + formid;
  });
}
