// WINDOW ON LOAD FUNCTION
window.onload = () => {
    $('#stationListTable').hide();
    $('#stationTableHeader').hide();
    $('#stationDetails').hide();
    $('#showLineGraph').hide();
    fetchStationList();
};

// GET CALL TO FETCH DATA FROM API END POINT, LIMITING TO 50 ONLY AS IT HAS TOO MUCH OF ITEMS IN RESPONSE
function fetchStationList(data) {
//     const fetchStationListURL = 'http://environment.data.gov.uk/flood-monitoring/id/stations?_limit=50';
      const fetchStationListURL = 'https://cors-anywhere.herokuapp.com/http://environment.data.gov.uk/flood-monitoring/id/stations?_limit=50';
    $.ajax({
        type: 'GET',
        url: fetchStationListURL,
        crossDomain: true,
        async: true,
        cache: true,
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (data) => {
            let element = data.items;
            for (let index in element) {
                var ID = data.items[index]['@id'],
                    stationReference = data.items[index]['stationReference'],
                    riverName = data.items[index]['riverName'],
                    catchmentName = data.items[index]['catchmentName'];
            }
            getStationDetails(data, ID, stationReference, catchmentName, riverName);
        },
        error: (response) => {
            errorHandler(response);
        }
    });
};

function getStationDetails(data) {
    let options = $("#selectedOption");

    $.each(data.items, function () {
        if (this.stationReference == null || this.stationReference == undefined ||
            this.stationReference == '' || this.catchmentName == null ||
            this.catchmentName == undefined || this.catchmentName == '') {
            options.append($("<option />").val('INVALID STATION').text('INVALID STATION'));
        } else {
            options.append($("<option />").val(this.stationReference).text(this.catchmentName));
        }
    });
}

function errorHandler(response) {
    console.log(`Status Code : ${response.status}, \n Status Text : ${response.statusText}`);
}

// DROP DOWN MENU FUNCTION
$(function () {
    $('#selectedOption').change(function (data) {
        $('#stationListTable').show();
        $('#stationTableHeader').show();
        $('#stationDetails').show();
        $('#showLineGraph').show();

        $('#selectedStationCode').empty();
        $('#time').empty();
        $('#readingValue').empty();

        let value = $(this).val(),
            counter = 0,
            num = 1,
            countStr = num.toString(),
            timeStamp = [],
            readingArray = [];

        const HrsInSeconds24 = 24 * 60 * 60 * 1000;
        const last24HRS = new Date(new Date().getTime() - HrsInSeconds24).toISOString();
//         const dataURL = 'http://environment.data.gov.uk/flood-monitoring/id/stations/' + value + '/readings?';
        const dataURL = 'https://cors-anywhere.herokuapp.com/http://environment.data.gov.uk/flood-monitoring/id/stations/'+value+'/readings?';
        const param = 'since=' + last24HRS;

        if ((value == '0') || (value === 0) || (value == 'INVALID STATION')) {
            $('#stationListTable').hide();
            $('#stationTableHeader').hide();
            $('#stationDetails').hide();
            $('#showLineGraph').hide();
        } else {
            getDataForSelectedStation(data, dataURL);
        }

        function getDataForSelectedStation(data, dataURL) {
            $.ajax({
                type: 'GET',
                url: dataURL,
                crossDomain: true,
                async: true,
                cache: true,
                dataType: 'json',
                contentType: 'application/json',
                data: param,
                success: (data) => {
                    let element = data.items;
                    for (let index in element) {
                        let readingValue = data.items[index]['value'],
                            dateTime = data.items[index]['dateTime'];

                        $('#selectedStationCode').html('<th>' + value + '</th>');
                        $('#time').append('<td></td>');
                        $('#readingValue').append('<td></td>');
                        $('#stationDetails tbody').append(`<tr>${$('#time').append(dateTime)}</tr></br>`);
                        $('#stationDetails tbody').append(`<tr>${$('#readingValue').append(readingValue)}</tr></br>`);

                        countStr++;
                        timeStamp.push(dateTime);
                        readingArray.push(readingValue);
                        counter += index;
                    }
                    showLineGraph(timeStamp, readingArray, value);
                },
                error: (response) => {
                    errorHandler(response);
                }
            });
        }
    });

    let backToTopButton = $('#backToTopButton');
    $(window).scroll(function () {
        if ($(window).scrollTop() > 200) {
            backToTopButton.addClass('show');
        } else {
            backToTopButton.removeClass('show');
        }
    });
    backToTopButton.on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, '200');
    });
});

// SHOW LINE GRAPH USING CHART.JS
function showLineGraph(timeStamp, readingArray, value) {
    let chartStatus = Chart.getChart('lineGraph');
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }
    const ctx = $('#lineGraph');
    const lineGraph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeStamp,
            datasets: [{
                label: value,
                data: readingArray,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
