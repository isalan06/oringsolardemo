$(function() {
    $("button").on("click", function () {
        $.ajax('/ExportExcel', {
            type: 'Post',
            contentType: 'text/json',
            data: setTableData,
            complete: function() { /* Do something with the response. */ }
        });
    });
  });