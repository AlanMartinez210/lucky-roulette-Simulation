'use strict';


// ガチャのアイテムと確率の一覧
const PITY_LIMIT = 160; // 天井
const GACHA_COST = 120; // 1回のガチャに必要な彩珀
let gachaPool = [];
let pityCounter = 0;
let saihakuAmount = 0; // 所持彩珀
let totalSpent = 0; // 合計課金額
let kiramekuCount = 0; // きらめく心の合計
let totalCount = 0; // ガチャの総回数
let is3KuramekuFlg = false;

const saihakuGachaPool = [
    { name: '彩珀 ×12000', probability: 0.0909, type: 'レア', val: { 彩珀: 12000 }, img: 'img/aya12000.png' },
    { name: '彩珀 ×6000', probability: 0.181818, type: 'レア', val: { 彩珀: 6000 }, img: 'img/aya6000.png' },
    { name: '彩珀 ×3000', probability: 0.727273, type: 'レア', val: { 彩珀: 3000 }, img: 'img/aya3000.png' },
];

const kiramekuGachaPool = [
    { name: 'きらめく心 ×3', probability: 0.031250, val: { きらめく心: 3 }, img: 'img/kirameku3.png' },
    { name: 'きらめく心 ×2', probability: 0.062500, val: { きらめく心: 2 }, img: 'img/kirameku2.png' },
    { name: 'きらめく心 ×1', probability: 0.906250, val: { きらめく心: 1 }, img: 'img/kirameku1.png' },
];

const nomalGachaPool = [
    { name: 'きらめく心 ×3', probability: 0.0002, type: 'レア', val: { きらめく心: 3 }, img: 'img/kirameku3.png' },
    { name: '彩珀 ×12000', probability: 0.0002, type: 'レア', val: { 彩珀: 12000 }, img: 'img/aya12000.png' },
    { name: 'きらめく心 ×2', probability: 0.0004, type: 'レア', val: { きらめく心: 2 }, img: 'img/kirameku2.png' },
    { name: 'きらめく心 ×1', probability: 0.0058, type: 'レア', val: { きらめく心: 1 }, img: 'img/kirameku1.png' },
    { name: '彩珀 ×6000', probability: 0.0004, type: 'レア', val: { 彩珀: 6000 }, img: 'img/aya6000.png' },
    { name: '彩珀 ×3000', probability: 0.0016, type: 'レア', val: { 彩珀: 3000 }, img: 'img/aya3000.png' },
    { name: '海藍の涙', probability: 0.002, type: 'レア', val: { 海藍の涙: 1 }, img: 'img/kairan.png' },
    { name: '青い水晶石 ×20', probability: 0.002, type: 'レア', val: { 青い水晶石: 20 }, img: 'img/suisyou20.png' },
    { name: '彩珀 ×1000', probability: 0.006, type: 'レア', val: { 彩珀: 1000 }, img: 'img/aya1000.png' },
    { name: '青い水晶石', probability: 0.075, type: '通常', val: { 青い水晶石: 1 }, img: 'img/suisyou1.png' },
    { name: '青い水晶石', probability: 0.075, type: '通常', val: { 青い水晶石: 1 }, img: 'img/suisyou1.png' },
    { name: '活性紫晶（青）', probability: 0.1658, type: '通常', val: { '活性紫晶（青）': 2 }, img: 'img/purple2.png' },
    { name: 'ファントムダスト・ランク2', probability: 0.166, type: '通常', val: { 'ファントムダスト・ランク2': 1 }, img: 'img/dust2.png' },
    { name: '強化スクロール', probability: 0.166, type: '通常', val: { 強化スクロール: 8 }, img: 'img/scroll8.png' },
    { name: '彩珀 ×120', probability: 0.1668, type: '通常', val: { 彩珀: 120 }, img: 'img/aya120.png' },
    { name: '彩珀 ×120', probability: 0.1668, type: '通常', val: { 彩珀: 120 }, img: 'img/aya120.png' },
];


// ガチャカウント用のテキスト要素
const pityCounterText = document.getElementById('pityCounterText');

function drawGacha() {

    // 1回のガチャに必要な彩珀を減算
    saihakuAmount -= GACHA_COST;

    // 総回数のカウントと、総回数イベントの実施
    totalCount++;
    updateTotalCountDisplay();
    totalCountEvent();


    // 総回数イベント
    let gachaPool;
    switch (totalCount) {
        case 301:
            toastr.info('猫の神の祝福が発動しました！');
            gachaPool = saihakuGachaPool;
            break;
        case 800:
            // 800回回したので、次回のきらめく心を引くと確定で3個になるフラグをONにする。
            toastr.info('煌めきの祝福が発動、次回のきらめく心は3個確定です！');
            is3KuramekuFlg = true;
            break;
        default:
            // 通常のガチャプールを使用
            gachaPool = nomalGachaPool;
            break;
    }

    // この回が160回目なら、きらめく心のガチャプールを使用する。
    if (pityCounter === PITY_LIMIT) gachaPool = kiramekuGachaPool;

    const totalWeight = gachaPool.reduce((sum, item) => sum + item.probability, 0);

    const rnd = Math.random() * totalWeight;
    let acc = 0;
    let selectedItems = [];

    for (let item of gachaPool) {
        acc += item.probability;
        if (rnd < acc) {

            selectedItems.push(item);

            // 同じprobabilityが存在する場合、gachaPoolから同じprobabilityのアイテムを取得する。
            // 取得したものはselectedItemsに追加する。
            const remainingItems = gachaPool.slice(gachaPool.indexOf(item) + 1);
            for (const next of remainingItems) {
                if (next.probability === item.probability) {
                    selectedItems.push(next);
                } else {
                    break;
                }
            }

            if (selectedItems.length > 1) {
                // 確率が同じアイテムが複数ある場合、ランダムに選択
                const randomIndex = Math.floor(Math.random() * selectedItems.length);
                item = selectedItems[randomIndex];
            }

            // もしきらめく心が出たら、pityCounterをリセット
            if (item.name.startsWith('きらめく心')) {

                if (is3KuramekuFlg) {
                    kiramekuCount += 3;
                    toastr.success(`祝福効果：きらめく心を3個獲得しました！`);

                    // アイテムを上書きして表示する
                    item = { name: 'きらめく心 ×3', probability: 0.0002, type: 'レア', val: { きらめく心: 3 }, img: 'img/kirameku3.png' };
                    is3KuramekuFlg = false; // 3個確定フラグをリセット
                } else {
                    kiramekuCount += item.val['きらめく心'];
                    toastr.success(`きらめく心を${item.val['きらめく心']}個獲得しました！`);
                }

                updateKiramekuCountDisplay();
                pityCounter = 0;
            } else {
                pityCounter++;
            }

            pityCounterText.innerText = pityCounter;

            // もし彩珀が出たら、所持彩珀に加算
            if (item.val && item.val['彩珀']) {
                saihakuAmount += item.val['彩珀'];
            }

            // 引いたアイテムを返す
            return item;
        }
    }

    return {
        name: 'ハズレ (内部エラー)',
        val: {},
        img: ''
    };

}

function addSaihakuAmount(amount) {
    saihakuAmount += amount;
    updateSaihakuDisplay();
}

function updateSaihakuDisplay() {
    document.getElementById('saihakuAmount').innerText = saihakuAmount;
}

// kiramekuCountの表示を更新する関数
function updateKiramekuCountDisplay() {
    document.getElementById('kiramekuCount').innerText = kiramekuCount;
}

function updateTotalCountDisplay() {
    document.getElementById('totalCount').innerText = totalCount;
}

// ガチャの総回数によるイベント
function totalCountEvent() {

    switch (totalCount) {
        case 3:
            addSaihakuAmount(300);
            toastr.info('3回報酬：300彩珀を獲得しました！');
            break;
        case 20:
            addSaihakuAmount(300);
            toastr.info('20回報酬：300彩珀を獲得しました！');
            break;
        case 55:
            addSaihakuAmount(600);
            toastr.info('55回報酬：600彩珀を獲得しました！');
            break;
        case 110:
            addSaihakuAmount(600);
            toastr.info('110回報酬：600彩珀を獲得しました！');
            break;
        case 180:
            addSaihakuAmount(800);
            toastr.info('180回報酬：800彩珀を獲得しました！');
            break;
        case 260:
            addSaihakuAmount(900);
            toastr.info('260回報酬：900彩珀を獲得しました！');
            break;
        default:
            // 何もしない
            break;
    }
}

function renderResultItem(item) {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.marginBottom = '8px';

    const img = document.createElement('img');
    img.src = item.img;
    img.alt = item.name;
    img.style.width = '50px';
    img.style.height = '50px';
    img.style.marginRight = '10px';

    const label = document.createElement('span');
    label.textContent = item.name;

    container.appendChild(img);
    container.appendChild(label);
    return container;
}

// 単発ガチャ
const resultDiv = document.getElementById('result');
document.getElementById('gachaButton').addEventListener('click', () => {
    if (saihakuAmount < 120) {
        alert('彩珀が不足しています（1回回すには120彩珀必要）');
        return;
    }
    resultDiv.innerHTML = '';
    const result = drawGacha();
    resultDiv.appendChild(renderResultItem(result));
    updateSaihakuDisplay();
});

// 10連ガチャ
document.getElementById('gacha10Button').addEventListener('click', () => {
    if (saihakuAmount < 1200) {
        alert('彩珀が不足しています（10回回すには1200彩珀必要）');
        return;
    }

    resultDiv.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const res = drawGacha();
        resultDiv.appendChild(renderResultItem(res));
    }
    updateSaihakuDisplay();
});

// 課金ボタン設定（HTMLに対応するIDを用意）
const purchaseOptions = {
    buy15000: 6480,
    buy8000: 3280,
    buy4900: 1980,
    buy2500: 980,
    buy800: 300,
    buy160: 60,
};

// 幸運応援ボタン設定
const luckSupportOptions = {
    add9600: 9600,
    add4800: 4800,
    add2400: 2400,
    add1200: 1200,
    add600: 600,
};

// 課金ボタンを押したときに合計課金額を更新
const priceMap = {
    buy15000: 15000,
    buy8000: 8000,
    buy4900: 4900,
    buy2500: 2500,
    buy800: 800,
    buy160: 160,
};

// 幸運応援ボタンを押したときに合計課金額を更新
const luckPriceMap = {
    add9600: 15000,
    add4800: 8000,
    add2400: 3200,
    add1200: 1600,
    add600: 800,
};

// 課金ボタンにイベントリスナーを追加
for (const [id, saihakuAmount] of Object.entries(purchaseOptions)) {
    document.getElementById(id).addEventListener('click', () => {
        addSaihakuAmount(saihakuAmount);

        // 合計課金額を更新
        const price = priceMap[id];
        totalSpent += price;
        // 合計課金額の表示を更新
        const totalSpentSpan = document.getElementById('totalSpent');
        totalSpentSpan.innerText = totalSpent.toLocaleString();
    });
}

// 幸運応援ボタンにイベントリスナーを追加
for (const [id, saihakuAmount] of Object.entries(luckSupportOptions)) {
    document.getElementById(id).addEventListener('click', () => {

        // 自身を押せなくする。
        document.getElementById(id).disabled = true;
        // ボタンの色を変える
        document.getElementById(id).style.backgroundColor = '#ccc';

        addSaihakuAmount(saihakuAmount);

        // 合計課金額を更新
        const price = luckPriceMap[id];
        totalSpent += price;
        // 合計課金額の表示を更新
        const totalSpentSpan = document.getElementById('totalSpent');
        totalSpentSpan.innerText = totalSpent.toLocaleString();
    });
}
