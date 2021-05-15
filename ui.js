({
    mPrevChatLength: 0,
    isChangeList: [false, false, false, false, false],
    /**チャットリストから現在のゲーム状態を表示する*/
    drawCurrent: function(ui, chat, width, height) {
        //カードの大きさ
        var cardSize = Math.min(width / 7, height / 8)

        var count = 0

        if (chat != null) {
            //出されている手を表示する
            for (var index = chat.length - 1; index >= this.mPrevChatLength; index--) {
                var rawBody = chat[index].rawBody;
                if (rawBody != null) {
                    if (rawBody.shareIndexList != null && rawBody.shareIndexList[0] == 0 && rawBody.shareIndexList[1] == 1 && rawBody.shareIndexList.length == 3) {
                        //手札のシグナルの場合、表示する
                        for (var i = 0; i < rawBody.shareState.length; i++) {
                            var str = this.markAndNumberToCardText(rawBody.shareState[i][0] - 1, ((rawBody.shareState[i][1] == 12) ? -1 : rawBody.shareState[i][1]) + 2)
                            ui.register(count, 10 + i * cardSize, 20, cardSize, cardSize);
                            ui.addFillText(count, (rawBody.shareState[i][0] - 1 == 0 || rawBody.shareState[i][0] - 1 == 3) ? "black" : "red", str, null);
                            ui.setOnClickListener(count, [ui.deepCopy(i), ui.deepCopy(count), this.isChangeList], function(data) {
                                //カードの交換の表示を切り替える
                                data[2][data[0]] = !data[2][data[0]]
                                ui.register(data[1] + 1, 10 + data[0] * cardSize + 10, cardSize + 30, cardSize - 10, cardSize - 10);
                                ui.addFillRect(data[1] + 1, "white")
                                ui.addFillText(data[1] + 1, "black", data[2][data[0]] ? "交換する" : "そのまま", null);
                                ui.show();
                            })
                            count++;

                            ui.register(count, 10 + i * cardSize + 10, cardSize + 30, cardSize - 10, cardSize - 10);
                            ui.addFillRect(count, "white")
                            ui.addFillText(count, "black", this.isChangeList[i] ? "交換する" : "そのまま", null);
                            ui.setOnClickListener(count, [ui.deepCopy(i), ui.deepCopy(count), this.isChangeList], function(data) {
                                //カードの交換の表示を切り替える
                                data[2][data[0]] = !data[2][data[0]]
                                ui.register(data[1], 10 + data[0] * cardSize + 10, cardSize + 30, cardSize - 10, cardSize - 10);
                                ui.addFillRect(data[1], "white")
                                ui.addFillText(data[1], "black", data[2][data[0]] ? "交換する" : "そのまま", null);
                                ui.show();
                            })
                            count++;
                        }

                        ui.register(count, 10 + 5 * cardSize, cardSize + 20, cardSize, cardSize);
                        ui.addFillRect(count, "white")
                        ui.addFillText(count, "black", "決定", null);
                        ui.setOnClickListener(count, [this.isChangeList], function(data) {
                            var select = []
                            for (var i = 0; i < data[0].length; i++) {
                                select.push(data[0][i] ? 1 : 0)
                            }
                            ui.sendSlectionChat(null, 0, select, null)
                        })
                        count++;
                    }
                    else if (rawBody.shareIndexList != null && rawBody.shareIndexList.length == 0) {
                        for (var i = 0; i < rawBody.shareState[0][1].length; i++) {
                            for (var i2 = 0; i2 < rawBody.shareState[0][1][i].length; i2++) {
                                var str = this.markAndNumberToCardText(rawBody.shareState[0][1][i][i2][0] - 1, ((rawBody.shareState[0][1][i][i2][1] == 12) ? -1 : rawBody.shareState[0][1][i][i2][1]) + 2)
                                ui.register(count, 10 + i2 * cardSize, cardSize * (i + 2) + 20, cardSize, cardSize);
                                ui.addFillText(count, (rawBody.shareState[0][1][i][i2][0] - 1 == 0 || rawBody.shareState[0][1][i][i2][0] - 1 == 3) ? "black" : "red", str, null);
                                count++;
                            }
                        }
                    }
                    else if (rawBody.signalId == -1) {
                        //プレイヤーIDをセット
                        this.mPlayerId = rawBody.signal
                    }
                }
            }

            ui.show();
        }
    },
    /**
     * Canvas要素をクリックしたときのイベント
     * @param ui CodeGameProjectUI
     * @param {*} pageX キャンバスの左端からクリック位置まで距離
     * @param {*} pageY キャンバスの上端からクリック位置まで距離
     */
    onClick: function(ui, pageX, pageY) {
        //クリックした位置に存在するviewのリストを取得
        var ids = ui.getViews(pageX, pageY)
        ui.execViewProcess(ids);
    },
    /** マーク（スート）と数字からトランプの文字を返す */
    markAndNumberToCardText: function(mark, num) {
        if (mark == 0) {
            //スペード
            if (num == 1) {
                return "🂡"
            }
            else if (num == 2) {
                return "🂢"
            }
            else if (num == 3) {
                return "🂣"
            }
            else if (num == 4) {
                return "🂤"
            }
            else if (num == 5) {
                return "🂥"
            }
            else if (num == 6) {
                return "🂦"
            }
            else if (num == 7) {
                return "🂧"
            }
            else if (num == 8) {
                return "🂨"
            }
            else if (num == 9) {
                return "🂩"
            }
            else if (num == 10) {
                return "🂪"
            }
            else if (num == 11) {
                return "🂫"
            }
            else if (num == 12) {
                return "🂭"
            }
            else if (num == 13) {
                return "🂮"
            }
        }
        else if (mark == 1) {
            if (num == 1) {
                return "🂱"
            }
            else if (num == 2) {
                return "🂲"
            }
            else if (num == 3) {
                return "🂳"
            }
            else if (num == 4) {
                return "🂴"
            }
            else if (num == 5) {
                return "🂵"
            }
            else if (num == 6) {
                return "🂶"
            }
            else if (num == 7) {
                return "🂷"
            }
            else if (num == 8) {
                return "🂸"
            }
            else if (num == 9) {
                return "🂹"
            }
            else if (num == 10) {
                return "🂺"
            }
            else if (num == 11) {
                return "🂻"
            }
            else if (num == 12) {
                return "🂽"
            }
            else if (num == 13) {
                return "🂾"
            }
        }
        else if (mark == 2) {
            if (num == 1) {
                return "🃁"
            }
            else if (num == 2) {
                return "🃂"
            }
            else if (num == 3) {
                return "🃃"
            }
            else if (num == 4) {
                return "🃄"
            }
            else if (num == 5) {
                return "🃅"
            }
            else if (num == 6) {
                return "🃆"
            }
            else if (num == 7) {
                return "🃇"
            }
            else if (num == 8) {
                return "🃈"
            }
            else if (num == 9) {
                return "🃉"
            }
            else if (num == 10) {
                return "🃊"
            }
            else if (num == 11) {
                return "🃋"
            }
            else if (num == 12) {
                return "🃍"
            }
            else if (num == 13) {
                return "🃎"
            }
        }
        else if (mark == 3) {
            if (num == 1) {
                return "🃑"
            }
            else if (num == 2) {
                return "🃒"
            }
            else if (num == 3) {
                return "🃓"
            }
            else if (num == 4) {
                return "🃔"
            }
            else if (num == 5) {
                return "🃕"
            }
            else if (num == 6) {
                return "🃖"
            }
            else if (num == 7) {
                return "🃗"
            }
            else if (num == 8) {
                return "🃘"
            }
            else if (num == 9) {
                return "🃙"
            }
            else if (num == 10) {
                return "🃚"
            }
            else if (num == 11) {
                return "🃛"
            }
            else if (num == 12) {
                return "🃝"
            }
            else if (num == 13) {
                return "🃞"
            }
        }
    }
})