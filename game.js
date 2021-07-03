//GAME_V3
({
    numberOfPlayer: [2, 3, 4, 5],
    initialize: function(ogm, random, rule, mode) {
        //トランプの束を生成
        var card = [];
        for (var index = 1; index <= 4; index++) {
            for (var index2 = 0; index2 <= 12; index2++) {
                //添え字が1の値はカードの強さである。0が2の数値,1が3の数値,11が13の数値,12が1の数値のカードと解釈する。
                card.push([ogm.deepCopy(index), ogm.deepCopy(index2)]);
            }
        }

        var shuffledCard = ogm.shuffle(random, card);
        var state = [shuffledCard, ogm.newArray(mode.numberOfPlayer)];
        for (var index = 0; index < mode.numberOfPlayer; index++) {
            //山札から5枚引く
            for (var index2 = 0; index2 < 5; index2++) {
                state[1][index].push(state[0].shift());
            }
        }

        //手札のソート
        for (var index = 0; index < mode.numberOfPlayer; index++) {
            ogm.stableSort(state[1][index], function(a, b) {
                if (a[1] == b[1]) {
                    return a[0] - b[0];
                }
                return a[1] - b[1];
            });
        }

        var signal = ogm.newArray(mode.numberOfPlayer);
        for (var index = 0; index < mode.numberOfPlayer; index++) {
            //プレイヤーIDを送る（シグナルIDの-1番目をプレイヤーIDを送る用とする）
            signal[index].push([-1, index]);
        }

        var selections = ogm.newArray(mode.numberOfPlayer);
        for (var index = 0; index < selections.length; index++) {
            selections[index].push(ogm.createPlayerSelect(0, 0, []));
        }

        var shares = ogm.newArray(mode.numberOfPlayer);
        for (var index = 0; index < shares.length; index++) {
            shares[index].push([ogm.STATE, 1, ogm.deepCopy(index)]);
        }

        return ogm.createGameNextResult(
            state,
            selections,
            shares,
            null,
            signal,
            null
        )
    },
    next: function(ogm, random, state, selectList, mode) {
        var shares = ogm.newArray(mode.numberOfPlayer);
        for (var index = 0; index < shares.length; index++) {
            shares[index].push([]);
        }

        for (var playerIndex = 0; playerIndex < selectList.length; playerIndex++) {
            for (var selectIndex = 0; selectIndex < selectList[playerIndex].length; selectIndex++) {
                var select = selectList[playerIndex][selectIndex].playersSelection;
                for (var cardIndex = 0; cardIndex < select.length; cardIndex++) {
                    if (select[cardIndex] == 1) {
                        //交換する場合、交換処理を行う
                        state[1][playerIndex][cardIndex] = state[0].shift();
                    }
                }
            }
        }

        //手札のソート
        for (var index = 0; index < mode.numberOfPlayer; index++) {
            state[1][index].sort(function(a, b) {
                if (a[1] == b[1]) {
                    return a[0] - b[0];
                }
                return a[1] - b[1];
            });
        }

        var winnerSet = []
        for (var index = 0; index < mode.numberOfPlayer; index++) {
            winnerSet.push(this.hand(ogm, state[1][index]))
        }

        return ogm.createGameNextResult(
            state,
            null,
            shares,
            null,
            null,
            winnerSet
        )
    },
    /**
     * ポーカーの手札の強さを返す
     * @param {} ogm 関数ライブラリ
     * @param {*} sortedCards 弱い順にソートされたポーカーの手札
     */
    hand: function(ogm, sortedCards) {
        //すべてのポーカーの手札の通り
        var NUMBER_OF_EVENTS = 2598960
        //ストレートフラッシュの手札の通り
        var STRAIGHT_FLUSH = 40
        var FOUR_OF_A_KIND = 624
        var FULL_HOUSE = 3744
        var FLUSH = 5108
        var STRAIGHT = 10200
        var THREE_OF_A_KIND = 54912
        var TWO_PAIR = 123552
        var ONE_PAIR = 1098240

        var isFlush = true;
        for (var index = 1; index < sortedCards.length; index++) {
            if (sortedCards[0][0] != sortedCards[index][0]) {
                isFlush = false;
            }
        }

        var isStraight = true;
        for (var index = 1; index < sortedCards.length; index++) {
            if (sortedCards[index - 1][1] != sortedCards[index][1] - 1) {
                isStraight = false;
                break;
            }
        }
        //上の判定で間違っていたしても54321はつながるのでそうならば、trueに戻す（sortedCards[0][1] == 12はカードの数字が1であるかの判定である）
        if (sortedCards[0][1] == 12 && sortedCards[1][1] == 3 && sortedCards[2][1] == 2 && sortedCards[3][1] == 1 && sortedCards[4][1] == 0) {
            isStraight = true;
        }

        if (isFlush && isStraight) {
            return NUMBER_OF_EVENTS - STRAIGHT_FLUSH + ogm.deepCopy(sortedCards[4][1]) - 5;
        }

        var maxSameCount = 0;
        var cardAndCountArray = [];
        var sameCount = 1;
        for (var index = 1; index < sortedCards.length; index++) {
            if (sortedCards[index - 1][1] == sortedCards[index][1]) {
                sameCount++;
            }
            else {
                if (maxSameCount < sameCount) {
                    maxSameCount = sameCount;
                }
                cardAndCountArray.push([ogm.deepCopy(sortedCards[index - 1][1]), ogm.deepCopy(sameCount)]);
                sameCount = 1;
            }
        }
        if (maxSameCount < sameCount) {
            maxSameCount = sameCount;
        }
        cardAndCountArray.push([ogm.deepCopy(sortedCards[sortedCards.length - 1][1]), ogm.deepCopy(sameCount)]);
        sameCount = 1;

        //ソート
        cardAndCountArray.sort(function(a, b) {
            if (a[1] == b[1]) {
                return - (a[0] - b[0]);
            }
            return - (a[1] - b[1]);
        });

        if (maxSameCount == 4) {
            //フォーカード
            return NUMBER_OF_EVENTS - STRAIGHT_FLUSH - FOUR_OF_A_KIND + (cardAndCountArray[0][0] * 12 + ((cardAndCountArray[1][0] < cardAndCountArray[0][0]) ? cardAndCountArray[1][0] : cardAndCountArray[1][0] - 1));
        }

        if (cardAndCountArray.length == 2) {
            //フルハウス
            return NUMBER_OF_EVENTS - STRAIGHT_FLUSH - FOUR_OF_A_KIND - FULL_HOUSE + (cardAndCountArray[0][0] * 12 + ((cardAndCountArray[1][0] < cardAndCountArray[0][0]) ? cardAndCountArray[1][0] : cardAndCountArray[1][0] - 1));
        }

        if (isFlush) {
            //フラッシュ
            return NUMBER_OF_EVENTS - STRAIGHT_FLUSH - FOUR_OF_A_KIND - FULL_HOUSE - FLUSH + (this.combinations(ogm.deepCopy(sortedCards[4][1]) + 1, 5) + this.combinations(ogm.deepCopy(sortedCards[3][1]) + 1, 4) + this.combinations(ogm.deepCopy(sortedCards[2][1]) + 1, 3) + this.combinations(ogm.deepCopy(sortedCards[1][1]) + 1, 2) + this.combinations(ogm.deepCopy(sortedCards[0][1]) + 1, 1) - (ogm.deepCopy(sortedCards[4][1]) - 5));
        }

        if (isStraight) {
            //ストレート
            return NUMBER_OF_EVENTS - STRAIGHT_FLUSH - FOUR_OF_A_KIND - FULL_HOUSE - FLUSH - STRAIGHT + (cardAndCountArray[0][0]);
        }

        if (maxSameCount == 3) {
            //スリーカード
            return NUMBER_OF_EVENTS - STRAIGHT_FLUSH - FOUR_OF_A_KIND - FULL_HOUSE - FLUSH - STRAIGHT - THREE_OF_A_KIND + (cardAndCountArray[0][0] * 13 * 13 + cardAndCountArray[1][0] * 13 + cardAndCountArray[2][0]);
        }

        if (maxSameCount == 2 && cardAndCountArray.length == 3) {
            //2ペア
            return NUMBER_OF_EVENTS - STRAIGHT_FLUSH - FOUR_OF_A_KIND - FULL_HOUSE - FLUSH - STRAIGHT - THREE_OF_A_KIND - TWO_PAIR + (cardAndCountArray[0][0] * 13 * 13 + cardAndCountArray[1][0] * 13 + cardAndCountArray[2][0]);
        }

        if (maxSameCount == 2) {
            //1ペア
            return NUMBER_OF_EVENTS - STRAIGHT_FLUSH - FOUR_OF_A_KIND - FULL_HOUSE - FLUSH - STRAIGHT - THREE_OF_A_KIND - TWO_PAIR - ONE_PAIR + (cardAndCountArray[0][0] * 13 * 13 * 13 + cardAndCountArray[1][0] * 13 * 13 + cardAndCountArray[2][0] * 13 + cardAndCountArray[3][0]);
        }

        //ハイカード
        //(a1+1)C5 + (a2+1)C4 + (a3+1)C3 + (a4+1)C2 + (a5+1)C1
        //(ogm.deepCopy(sortedCards[4][1]) - 5)はストレートの数
        return this.combinations(ogm.deepCopy(sortedCards[4][1]) + 1, 5) + this.combinations(ogm.deepCopy(sortedCards[3][1]) + 1, 4) + this.combinations(ogm.deepCopy(sortedCards[2][1]) + 1, 3) + this.combinations(ogm.deepCopy(sortedCards[1][1]) + 1, 2) + this.combinations(ogm.deepCopy(sortedCards[0][1]) + 1, 1) - (ogm.deepCopy(sortedCards[4][1]) - 5) 
    },
    //xCnの計算
    combinations: function(x, n) {
        var result = 1;
        for (var i = 1; i <= n; i++) {
            result = result * (x - i);
        }
        for (var i = 1; i <= n; i++) {
            result = result / i;
        }
        return result;
    },
    selectionConstraintsList: [{
        judge: function(
            ogm,
            selection,
            proof,
            shareState,
            selectionSignal
        ) {
            if (!ogm.isArray(selection)) {
                return false;
            }
            if (selection.length != 5) {
                return false
            }
            for (var index = 0; index < 5; index++) {
                if (!(selection[index] == 0 || selection[index] == 1)) {
                    return false;
                }
            }
            return true;
        },
        /**
         * 選択可能な選択を少なくとも一つ返す
         * @param {*} shareState 
         * @param {*} selectionSignal
         * @returns 「可能な選択」の配列 
         */
        createDefault: function(
            ogm,
            shareState,
            selectionSignal
        ) {
            var selections = [];
            selections.push([
                [0, 0, 0, 0, 0], null
            ])
            return selections;
        },
        /**
         * すべての選択肢を生成する（許可される選択はすべて含んでいることを保証する）
         * @param {}} shareState 
         * @param {*} selectionSignal 
         */
        createAll: function(
            ogm,
            shareState,
            selectionSignal
        ) {
            var selections = [];
            for (var count = 0; count < 2; count++) {
                for (var count2 = 0; count2 < 2; count2++) {
                    for (var count3 = 0; count3 < 2; count3++) {
                        for (var count4 = 0; count4 < 2; count4++) {
                            for (var count5 = 0; count5 < 2; count5++) {
                                selections.push([
                                    [ogm.deepCopy(count), ogm.deepCopy(count2), ogm.deepCopy(count3), ogm.deepCopy(count4), ogm.deepCopy(count5)], null
                                ]);
                            }
                        }
                    }
                }
            }
            return selections;
        }
    }]
})