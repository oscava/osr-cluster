Quant.Model.extends({
	receiveData:function( current ){
		this.current = current;
	},
	nextTick:function( current ){
		this.buy(3);
	},
	buy:function(number){
		this.process.publish("buy",number);
	}
});