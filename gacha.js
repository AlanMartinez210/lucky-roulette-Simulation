"use strict";

// ガチャのアイテムと確率の一覧
const gachaPool = [
    { name: "きらめく心 ×3", probability: 0.0002, type: "レア", val: { "きらめく心": 3 }, img: "img/kirameku3.png" },
    { name: "彩珀 ×12000", probability: 0.0002, type: "レア", val: { "彩珀": 12000 }, img: "img/aya12000.png" },
    { name: "きらめく心 ×2", probability: 0.0004, type: "レア", val: { "きらめく心": 2 }, img: "img/kirameku2.png" },
    { name: "きらめく心 ×1", probability: 0.0058, type: "レア", val: { "きらめく心": 1 }, img: "img/kirameku1.png" },
    { name: "彩珀 ×6000", probability: 0.0004, type: "レア", val: { "彩珀": 6000 }, img: "img/aya6000.png" },
    { name: "彩珀 ×3000", probability: 0.0016, type: "レア", val: { "彩珀": 3000 }, img: "img/aya3000.png" },
    { name: "海藍の涙 ×1", probability: 0.0020, type: "レア", val: { "海藍の涙": 1 }, img: "img/kairan.png" },
    { name: "青い水晶石 ×20", probability: 0.0020, type: "レア", val: { "青い水晶石": 20 }, img: "img/suisyou20.png" },
    { name: "彩珀 ×1000", probability: 0.0060, type: "レア", val: { "彩珀": 1000 }, img: "img/aya1000.png" },
    { name: "青い水晶石 ×1", probability: 0.0750, type: "通常", val: { "青い水晶石": 1 }, img: "img/suisyou1.png" },
    { name: "青い水晶石 ×1", probability: 0.0750, type: "通常", val: { "青い水晶石": 1 }, img: "img/suisyou1.png" },
    { name: "活性紫晶（青） ×2", probability: 0.1658, type: "通常", val: { "活性紫晶（青）": 2 }, img: "img/purple2.png" },
    { name: "ファントムダスト・ランク2 ×1", probability: 0.1660, type: "通常", val: { "ファントムダスト・ランク2": 1 }, img: "img/dust2.png" },
    { name: "強化スクロール ×8", probability: 0.1660, type: "通常", val: { "強化スクロール": 8 }, img: "img/scroll8.png" },
    { name: "彩珀 ×120", probability: 0.1668, type: "通常", val: { "彩珀": 120 }, img: "img/aya120.png" },
    { name: "彩珀 ×120", probability: 0.1668, type: "通常", val: { "彩珀": 120 }, img: "img/aya120.png" }
];

const pityLimit = 160; // 天井
let pityCounter = 0;
let aya = 0; // 所持彩珀
let totalSpent = 0; // 合計課金額
let kiramekuCount = 0; // きらめく心の合計
const pityCounterText = document.getElementById("pityCounterText");

function drawGacha() {
    aya -= 120;

    // この回が160回目なら、きらめく心を引く
    if (pityCounter >= pityLimit) {

        // この処理に入った場合天井をリセットする。
        pityCounter = 0;
        pityCounterText.innerText = pityCounter;
        const kiramekuPool = [
            { name: "きらめく心 ×3", probability: 0.0002, val: { "きらめく心": 3 }, img: "img/kirameku3.png" },
            { name: "きらめく心 ×2", probability: 0.0004, val: { "きらめく心": 2 }, img: "img/kirameku2.png" },
            { name: "きらめく心 ×1", probability: 0.0058, val: { "きらめく心": 1 }, img: "img/kirameku1.png" }
        ];

        const total = kiramekuPool.reduce((sum, item) => sum + item.probability, 0);
        const rnd2 = Math.random() * total;
        let acc2 = 0;
        for (const item of kiramekuPool) {
            acc2 += item.probability;
            if (rnd2 < acc2) return item;
        }

    } else {

        const rnd = Math.random();
        let acc = 0;

        for (const item of gachaPool) {
            acc += item.probability;
            if (rnd < acc) {
                // もし当たりが出たら、pityCounterをリセット
                if (item.name.startsWith("きらめく心")) {
                    kiramekuCount += item.val["きらめく心"];
                    pityCounter = 0;
                } else {
                    pityCounter++;
                }

                pityCounterText.innerText = pityCounter;

                // もし彩珀が出たら、所持彩珀に加算
                if (item.val && item.val["彩珀"]) {
                    aya += item.val["彩珀"];
                }

                // 引いたアイテムを返す
                return item;
            }
        }
    }


    return { name: "ハズレ (内部エラー)", val: {}, img: "" };
}

function addAya(amount) {
    aya += amount;
    updateAyaDisplay();
}

function updateAyaDisplay() {
    document.getElementById("ayaAmount").innerText = `所持彩珀: ${aya} 個`;
}

// kiramekuCountの表示を更新する関数
function updateKiramekuCountDisplay() {
    document.getElementById("kiramekuCount").innerText = `きらめく心の合計: ${kiramekuCount}`;
}

function renderResultItem(item) {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.marginBottom = "8px";

    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.name;
    img.style.width = "50px";
    img.style.height = "50px";
    img.style.marginRight = "10px";

    const label = document.createElement("span");
    label.textContent = item.name;

    container.appendChild(img);
    container.appendChild(label);
    return container;
}

// 単発ガチャ
const resultDiv = document.getElementById("result");
document.getElementById("gachaButton").addEventListener("click", () => {
    if (aya < 120) {
        alert("彩珀が不足しています（1回回すには120彩珀必要）");
        return
    }
    resultDiv.innerHTML = "";
    const result = drawGacha();
    resultDiv.appendChild(renderResultItem(result));
    updateAyaDisplay();
});

// 10連ガチャ
document.getElementById("gacha10Button").addEventListener("click", () => {
    if (aya < 1200) {
        alert("彩珀が不足しています（10回回すには1200彩珀必要）");
        return;
    }

    resultDiv.innerHTML = "";
    for (let i = 0; i < 10; i++) {
        const res = drawGacha();
        resultDiv.appendChild(renderResultItem(res));
    }
    updateAyaDisplay();
});

// 課金ボタン設定（HTMLに対応するIDを用意）
const purchaseOptions = {
    buy15000: 6480,
    buy8000: 3280,
    buy4900: 1980,
    buy2500: 980,
    buy800: 300,
    buy160: 60
};

// 課金ボタンを押したときに合計課金額を更新
const priceMap = {
    buy15000: 15000,
    buy8000: 8000,
    buy4900: 4900,
    buy2500: 2500,
    buy800: 800,
    buy160: 160
};


// 課金ボタンにイベントリスナーを追加
for (const [id, ayaAmount] of Object.entries(purchaseOptions)) {
    document.getElementById(id).addEventListener("click", () => {
        addAya(ayaAmount);

        // 合計課金額を更新
        const price = priceMap[id];
        totalSpent += price;
        // 合計課金額の表示を更新
        const totalSpentSpan = document.getElementById("totalSpent");
        totalSpentSpan.innerText = totalSpent.toLocaleString();
    });
}