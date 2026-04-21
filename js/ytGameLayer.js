var ytGameLayer = (function () {
	function ytGameLayer (car, place) {
		var s = this;
		LExtends(s, LSprite, []);

		s.choosedCar = car;
		s.choosedPlace = place;

		s.speed = 15;

		s.gameOver = false;
		s.goalReached = false;

		s.stageLayer = new LSprite();
		s.addChild(s.stageLayer);

		s.background = new ytBackground(dataList[place]);
		s.background.speed = s.speed;
		s.stageLayer.addChild(s.background);

		s.carLayer = new ytCarLayer(car);
		s.stageLayer.addChild(s.carLayer);

		s.streetView = new ytStreetView(place);
		s.streetView.speed = s.speed;
		s.stageLayer.addChild(s.streetView);

		s.overLayer = new LSprite();
		s.addChild(s.overLayer);

		s.point = new ytPoint();
		s.point.x = s.point.y = 10;
		s.overLayer.addChild(s.point);

		s.pauseBtn = null;

		s.addPauseBtn();

		s.fadeIn();

		LEvent.addEventListener(LGlobal.window, LKeyboardEvent.KEY_DOWN, function(e) {
			if (s.gameOver || (s.pauseBtn && s.pauseBtn.pause)) return;

			if (e.keyCode == 37) { // Pijltje naar links
				s.carLayer.car.moveTo(0);
			} else if (e.keyCode == 39) { // Pijltje naar rechts
				s.carLayer.car.moveTo(1);
			}
		});

		s.stageLayer.addEventListener(LMouseEvent.MOUSE_UP, s.mouseUp);
		s.addEventListener(LEvent.ENTER_FRAME, s.loop);
	}

	ytGameLayer.prototype.fadeIn = function () {
		var s = this;

		var fadeLayer = new LSprite();
		fadeLayer.graphics.drawRect(0, "", [0, 0, LGlobal.width, LGlobal.height], true, "black");
		fadeLayer.alpha = 1;
		s.overLayer.addChild(fadeLayer);

		LTweenLite.to(fadeLayer, 3, {
			alpha : 0,
			ease : Sine.easeIn,
			onComplete : function (o) {
				o.remove();
			}
		});
	};

	ytGameLayer.prototype.addPauseBtn = function () {
		var s = this,
		bmpd = dataList["button_pause_sheet"],
		list = LGlobal.divideCoordinate(bmpd.width, bmpd.height, 3, 1);

		var d = list[0][0];
		var normalBmpd = bmpd.clone();
		normalBmpd.setProperties(d.x, d.y, d.width, d.height);

		d = list[1][0];
		var overBmpd = bmpd.clone();
		overBmpd.setProperties(d.x, d.y, d.width, d.height);

		d = list[2][0];
		var downBmpd = bmpd.clone();
		downBmpd.setProperties(d.x, d.y, d.width, d.height);

		var normalBmp = new LBitmap(normalBmpd);
		var overBmp = new LBitmap(overBmpd);
		var downBmp = new LBitmap(downBmpd);

		s.pauseBtn = new LButton(normalBmp, overBmp, downBmp, downBmp.clone());
		s.pauseBtn.pause = false;
		s.pauseBtn.x = LGlobal.width - s.pauseBtn.getWidth();
		s.overLayer.addChild(s.pauseBtn);

		s.pauseBtn.addEventListener(LMouseEvent.MOUSE_UP, function () {
			s.pauseBtn.pause = !s.pauseBtn.pause;

			if (s.pauseBtn.pause) {
				s.pauseBtn.setState(LButton.STATE_DISABLE);
				s.pauseBtn.mouseEnabled = true;
			} else {
				s.pauseBtn.setState(LButton.STATE_ENABLE);
			}

			if (s.carLayer) {
				for (var i = 0, l = s.carLayer.numChildren; i < l; i++) {
					var o = s.carLayer.getChildAt(i), t = o.changeDirTween;

					if (t) {
						if (s.pauseBtn.pause) {
							t.pause();
						} else {
							t.resume();
						}
					}
				}
			}
		});
	};

	ytGameLayer.prototype.mouseUp = function (e) {
		var s = e.currentTarget.parent;

		if (!s.carLayer || !s.carLayer.car) {
			return;
		}

		if (s.pauseBtn && s.pauseBtn.pause) {
			return;
		}

		if (e.offsetX < LGlobal.width / 2) {
			s.carLayer.car.moveTo(0);
		} else {
			s.carLayer.car.moveTo(1);
		}
	};

	ytGameLayer.prototype.showRandomPhoto = function () {
		var s = this;
		var rand = Math.floor(Math.random() * 102) + 1;
		var fileName = (rand < 10 ? "0" : "") + rand;
		var url = "https://md19811.github.io/Manillen/randomM/" + fileName + ".jpg";

		var loader = new LLoader();

		loader.addEventListener(LEvent.COMPLETE, function (event) {
			if (!event.target) return;

			var bitmapData = new LBitmapData(event.target);
			var photo = new LBitmap(bitmapData);

			if (photo.getWidth() == 0) {
				s.goalReached = false;
				if(s.pauseBtn) s.pauseBtn.pause = false;
				return;
			}

			// Bereken schaling voor schermvullend
			var targetScaleX = LGlobal.width / photo.getWidth();
			var targetScaleY = LGlobal.height / photo.getHeight();

			photo.x = LGlobal.width / 2;
			photo.y = LGlobal.height / 2;
			photo.scaleX = 0;
			photo.scaleY = 0;
			photo.alpha = 0;

			var photoLayer = new LSprite();
			s.overLayer.addChild(photoLayer);
			photoLayer.addChild(photo);

			var uiLayer = new LSprite();
			s.overLayer.addChild(uiLayer);

			LTweenLite.to(photo, 1.5, {
				x: 0, y: 0,
				scaleX: targetScaleX,
				scaleY: targetScaleY,
				alpha: 1,
				ease: LEasing.Quad.easeOut,
				onComplete: function() {
					if(s.pauseBtn) s.pauseBtn.pause = true;

					// --- KNOP: SPEEL OPNIEUW ---
					var btnReplay = new LSprite();
					btnReplay.graphics.drawRoundRect(2, "#ffffff", [0, 0, 200, 50, 5], true, "#ff0000");
					var txtReplay = new LTextField();
					txtReplay.text = "SPEEL OPNIEUW";
					txtReplay.color = "#ffffff";
					txtReplay.size = 15;
					txtReplay.x = (200 - txtReplay.getWidth()) / 2;
					txtReplay.y = 12;
					btnReplay.addChild(txtReplay);
					btnReplay.x = (LGlobal.width - 200) / 2;
					btnReplay.y = LGlobal.height - 140;
					uiLayer.addChild(btnReplay);

					// --- KNOP: FULLSCREEN (VERBETERD) ---
var btnFull = new LSprite();
btnFull.graphics.drawRoundRect(2, "#ffffff", [0, 0, 200, 50, 5], true, "#0000ff");
var txtFull = new LTextField();
txtFull.text = "OPEN VOLLEDIG"; // Tekst aangepast voor de duidelijkheid
txtFull.color = "#ffffff";
txtFull.size = 15;
txtFull.x = (200 - txtFull.getWidth()) / 2;
txtFull.y = 12;
btnFull.addChild(txtFull);
btnFull.x = (LGlobal.width - 200) / 2;
btnFull.y = LGlobal.height - 70;
uiLayer.addChild(btnFull);

uiLayer.mouseEnabled = true;

btnReplay.addEventListener(LMouseEvent.MOUSE_UP, function(e) {
    location.reload();
});

// GEWIJZIGDE LOGICA: Open foto in nieuw venster
btnFull.addEventListener(LMouseEvent.MOUSE_UP, function(e) {
    // We gebruiken de variabele 'url' die al bovenin de showRandomPhoto functie is gedefinieerd
    window.open(url, '_blank');
});

					// Klik op de foto zelf om terug te gaan naar het spel
					photo.addEventListener(LMouseEvent.MOUSE_UP, function(e) {
						photoLayer.remove();
						uiLayer.remove();
						if(s.pauseBtn) {
							s.pauseBtn.pause = false;
							s.pauseBtn.setState(LButton.STATE_ENABLE);
						}
					});
				}
			});
		});

		loader.load(url, "bitmapData");
	};

	ytGameLayer.prototype.loop = function (e) {
		var s = e.currentTarget;

		if (s.gameOver) {
			return;
		}

		if (s.pauseBtn && s.pauseBtn.pause) {
			return;
		}

		if (s.streetView) {
			s.streetView.loop();
		}

		if (s.background) {
			s.background.loop();
		}

		if (s.carLayer) {
			var r = s.carLayer.loop();

			s.gameOver = r[0];

			if (s.gameOver) {
				s.pauseBtn.mouseEnabled = false;
				s.pauseBtn.setCursorEnabled(false);

				LTweenLite.removeAll();

				var explosion = new ytExplosion();
				explosion.x = r[1] - (explosion.getWidth() - r[3]) / 2;
				explosion.y = r[2] - (explosion.getHeight() - r[4]) / 2;
				s.overLayer.addChild(explosion);

				explosion.addEventListener(ytExplosion.EVENT_PLAY_OVER, function () {
					var resultBox = new ytResultBox(s.point.num);
					resultBox.x = (LGlobal.width - resultBox.getWidth()) / 2;
					resultBox.y = (LGlobal.height - resultBox.getHeight()) / 2;
					s.overLayer.addChild(resultBox);

					resultBox.addEventListener(ytResultBox.EVENT_CLICK_BUTTON, function (e) {
						if (e.msg == 0) {
							addGameInterface(s.choosedCar, s.choosedPlace);
						} else if (e.msg == 1) {
							addMenuInterface();
						} else if (e.msg == 2) {
							addOptionInterface();
						}

						s.remove();
					});
				});

				return;
			}
		}

		if (s.point) {
			s.point.loop();

			// CHECK VOOR 100 PUNTEN (DOEL)
			if (s.point.num >= 500 && !s.goalReached) {
				s.goalReached = true;
				if(s.pauseBtn) s.pauseBtn.pause = true;
				s.showRandomPhoto();
			}
		}
	};

	return ytGameLayer;
})();