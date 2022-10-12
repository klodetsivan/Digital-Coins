/// <reference path="jquery-3.6.0.js" />

$(() => {

    let coins = [];
    const choosenCoins = new Map();
    const favorite = [];
    let coinToAddToFavorite;
    let chartInterval;
    clearInterval(chartInterval);


    //single page with sections
    $("section").hide();
    $("#homeSection").show();

    $("a").on("click", function () {
        const dataSection = $(this).attr("data-section")
        $("section").hide();
        $("#" + dataSection).show();
        $(".searchBox").show
    });

    // Showing additional coin info
    $("#homeSection").on("click", ".card > button", async function () {
        clearInterval(chartInterval);
        const coinId = $(this).attr("id");
        const coin = await getMoreInfo(coinId);
        if ($(this).next().hasClass("moreInfo") === false) {
            $(this).text("Less info");
            $(this).next().addClass("moreInfo");
            if (choosenCoins.has(coinId)) {
                let choosenCoin = choosenCoins.get(coinId);
                getMoreCoinInfo(coinId, choosenCoin);
            }
            else {
                $(this).next().append(`<div><img class="loader" src="/assets/gif/loading3.gif" alt="load"></div>`);
                setTimeout(function () {
                    let newCoin = coin.market_data.current_price;
                    getMoreCoinInfo(coinId, newCoin);
                    choosenCoins.set(coinId, { ils: coin.market_data.current_price.ils, usd: coin.market_data.current_price.usd, eur: coin.market_data.current_price.eur });
                    setTimeout(() => choosenCoins.delete(coinId), 120000);
                }, 1000);
            }
        }
        else {
            $(this).text("More Info");
            $(this).next().fadeOut(500).removeClass("moreInfo");
        }
    });

    // get more info(rates) on coin
    function getMoreCoinInfo(coinId, choosenCoin) {
        $(`#${coinId}`).next().html(`
             <div class="moreInfoContainer">
             &#0036 ${choosenCoin.usd} <br>
             &#8364 ${choosenCoin.eur} <br>
             ILS ${choosenCoin.ils}
             </div>
             `).fadeIn(500);
    }

    // Delete coin
    function deleteCoin(coinName) {
        const coinToRemove = favorite.indexOf(favorite.find((coin) => coin.coinName === coinName))
        favorite.splice(coinToRemove, 1);
    }

    // //Toggle
    $("#homeSection").on("click", "i", async function () {
        //add coin to modal content if not favorite.length > 5
        const coinId = $(this).parent().attr("class");
        const coin = await getMoreInfo(coinId);
        let coinName = `${coin.id}`
        if ($(this).hasClass("fa-solid fa-toggle-on")) {
            $(this).removeClass("fa-solid fa-toggle-on");
            $(this).addClass("fa-solid fa-toggle-off");
            deleteCoin(coinName)
            return;
        }
        let sixthCoin = `To add "${coinName}" you first must unselect one of the following:`
        if (favorite.length < 5) {
            $(this).removeClass("fa-solid fa-toggle-off");
            $(this).addClass("fa-solid fa-toggle-on");
            favorite.push({ coinName, symbol: coin.symbol });
            let div = $(`
            <div class="favoriteCoinContainer">
             <div class="digitalCoin${coinName}">${coinName}</div>
             <div class="choosen${coinName}">
             <i id="${coin.symbol}" class="fa-solid fa-toggle-on"></i>
             </div>
            </div>`)
            $(".modal-content").append(div);
        }
        else {
            coinToAddToFavorite = { coinName, symbol: coin.symbol };
            $(".toRemove").html(sixthCoin);
            $(".modal").css("display", "block");
            return
        }
        $("#closeModal").on("click", () => {
            $(".modal").css("display", "none");
        })

        // modal toggle 
        $(`.choosen${coinName}`).on('click', function () {
            favorite.splice(coinName, 1, { coinName: coinToAddToFavorite.coinName, symbol: coinToAddToFavorite.symbol });
            $(`.digitalCoin${coinName}`).html(coinToAddToFavorite.coinName)
            $(".modal").css("display", "none");
            $(`.${coinName}`).children().removeClass("fa-solid fa-toggle-on")
            $(`.${coinName}`).children().addClass("fa-solid fa-toggle-off")
            $(`.${coinToAddToFavorite.coinName}`).children().removeClass("fa-solid fa-toggle-off")
            $(`.${coinToAddToFavorite.coinName}`).children().addClass("fa-solid fa-toggle-on")
            $(".toRemove").html("");
            $(`.choosen${coinName}`).attr('class', `choosen${coinToAddToFavorite.coinName}`)
            $(`.digitalCoin${coinName}`).attr('class', `digitalCoin${coinToAddToFavorite.coinName}`)
            coinName = coinToAddToFavorite.coinName
        })

    });

    //search box
    $("input[type=search]").on("keyup", function () {

        const textToSearch = $(this).val().toLowerCase();
        if (textToSearch === "") {
            displayCoins(coins);
        }
        else {
            const filteredCoins = coins.filter(c => c.symbol.includes(textToSearch));

            if (filteredCoins.length <= 0) {
                return displayCoins(coins);
            }
            displayCoins(filteredCoins);
        }
    });

    handleCoins();
    // Getting coins from server
    async function handleCoins() {
        try {
            coins = await getJSON("https://api.coingecko.com/api/v3/coins");
            displayCoins(coins);
        }
        catch (err) {
            alert(err.message);
        }
    }

    // Displaying coins on page
    function displayCoins(coins) {
        let content = "";
        for (const coin of coins) {
            const card = createCard(coin);
            content += card;
        }
        $("#homeSection").html(content)

    }

    // Create card
    function createCard(coin) {
        const card = `
              <div class="card">
              <div class=${coin.id}>
            <i class="fa-solid fa-toggle-off"></i>
              </div>
                <span>${coin.symbol}</span> <br>
                <span>${coin.name}</span> <br>
                <img src="${coin.image.thumb}" /> <br>
                <button class="btnMoreInfo" id="${coin.id}">More Info</button>
                <span></span>
            </div>
        `;
        return card;
    }


    // Get more info about coin
    async function getMoreInfo(coinId) {
        const coin = await getJSON("https://api.coingecko.com/api/v3/coins/" + coinId);
        console.log(coin);
        return coin;
    }

    // Getting JSON from url
    function getJSON(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                success: data => {
                    resolve(data);
                },
                error: err => {
                    reject(err);
                }
            })
        });
    }

    // Home Section
    $("a[data-section='homeSection']").on("click", function () {
        clearInterval(chartInterval);
        $(".searchBox").show
    });

    // About section
    $("a[data-section='aboutSection']").on("click", function () {
        clearInterval(chartInterval);
        $(".searchBox").hide()
        const about = `
    <div id="topContainer">
     <h1>hi! my name is sivan klodet</h1>
     <img src="/assets/images/klodet.png" alt="klodet">
    </div>
    <div id="middleContainer">
     <p>Hello! my name is Sivan Klodet and i am a Full Stack Web Developer! <br>
        In my spare time i like to cook <br>
        I am the founder of "stepbystep food by klodet", which is an instegram
        food blog. <br>
        I am also the founder of "TLV Airport Cats", <br>
        which is a facebook group to help airport cats
        get addopted.
     </p>
    </div>
    <div id="bottomContainer">
     <a  href="https://www.linkedin.com/"><img class="logo" src="assets/images/linkedin.png"></img></a>
     <a  href="https://www.instagram.com/stepbystep__food_by_klodet/"><img class="logo" src="assets/images/instagram.png"></img></a>
     <a  href="https://www.facebook.com/klodet.sivan/"><img class="logo" src="assets/images/facebook.png"></img></a>
     <p class="copyright">© Sivan Klodet Zarfati.</p>
    </div>
    `
        $("#aboutSection").html(about);
    });

    // Live Reports
    $("#reportSection").append("<div id='chartContainer'> </div>");

    $("a[data-section='reportSection']").on("click", function () {
        $(".searchBox").hide()
        $("#chartContainer").html("");
        let coin1 = [];
        let coin2 = [];
        let coin3 = [];
        let coin4 = [];
        let coin5 = [];
        let coinKeys = [];

        // No selected coins message
        if (favorite.length === 0) {
            $("#chartContainer").html("Please select at least one coin");
            return;
        }

        chartInterval = setInterval(() => {
            getDataFromAPI();
        }, 2000);

        // Getting data from API
        function getDataFromAPI() {
            let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=`;
            let count = 0;
            for (let coin of favorite) {
                if (count === favorite.length - 1) {
                    url += `${coin.symbol}&tsyms=USD`;
                } else {
                    url += `${coin.symbol},`;
                }
                count++
            }

            $.get(url).then(result => {
                let currentTime = new Date();
                let coinCounter = 1;

                for (let coin in result) {
                    if (coinCounter === 1) {
                        coin1.push({ x: currentTime, y: result[coin].USD });
                        coinKeys.push(coin);
                    }

                    if (coinCounter === 2) {
                        coin2.push({ x: currentTime, y: result[coin].USD });
                        coinKeys.push(coin);
                    }

                    if (coinCounter === 3) {
                        coin3.push({ x: currentTime, y: result[coin].USD });
                        coinKeys.push(coin);
                    }

                    if (coinCounter === 4) {
                        coin4.push({ x: currentTime, y: result[coin].USD });
                        coinKeys.push(coin);
                    }

                    if (coinCounter === 5) {
                        coin5.push({ x: currentTime, y: result[coin].USD });
                        coinKeys.push(coin);
                    }
                    coinCounter++;
                }
                createChart();
            })
        }

        // Create chart
        function createChart() {
            let options = {
                animationEnabled: false,
                backgroundColor: "white",
                title: {
                    text: "crypto chart"
                },
                axisX: {
                    ValueFormatString: "HH: mm: ss",
                    titleFontColor: "black",
                    lineColor: "black",
                    labelFontColor: "black",
                    tickColor: "red"
                },
                axisY: {
                    suffix: "$",
                    titleFontColor: "black",
                    lineColor: "black",
                    labelFontColor: "black",
                    tickColor: "blue"
                },
                tooltip: {
                    shared: true
                },
                data: [{
                    type: "spline",
                    name: coinKeys[0],
                    showInLegend: true,
                    markerType: "square",
                    xValueFormatString: "HH: mm: ss",
                    dataPoints: coin1
                },
                {
                    type: "spline",
                    name: coinKeys[1],
                    showInLegend: true,
                    markerType: "square",
                    xValueFormatString: "HH: mm: ss",
                    dataPoints: coin2
                },
                {
                    type: "spline",
                    name: coinKeys[2],
                    showInLegend: true,
                    markerType: "square",
                    xValueFormatString: "HH: mm: ss",
                    dataPoints: coin3
                },
                {
                    type: "spline",
                    name: coinKeys[3],
                    showInLegend: true,
                    markerType: "square",
                    xValueFormatString: "HH: mm: ss",
                    dataPoints: coin4
                },
                {
                    type: "spline",
                    name: coinKeys[4],
                    showInLegend: true,
                    markerType: "square",
                    xValueFormatString: "HH: mm: ss",
                    dataPoints: coin5
                }]
            }
            $("#chartContainer").CanvasJSChart(options);
            $("#chartContainer").append(options);
        }
    })

});




