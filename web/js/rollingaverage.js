class RollinAverage {
    constructor(widthOne, widthDecreasing) {
        this.dataSet = [];
        this.widthOne = widthOne;
        this.widthDecreasing = widthDecreasing;
    }

    addData(data) {
        this.dataSet.push(data);
    }

    sort() {
        this.dataSet.sort(function(a,b) 
        {
            return a.x - b.x;
        }
        );
        this.lowest = this.dataSet[0].x;
        this.highest = this.dataSet[this.dataSet.length - 1].x;
    }

    getAverage(x) {
        let sumValue = 0;
        let sumWeight = 0;
        let overInterval = false;
        for(let i = 0; (i<this.dataSet.length - 1) && !overInterval; i++) {
            let data = this.dataSet[i];
            if (data.x > x - this.widthOne -this.widthDecreasing) {
                if (data.x > x - this.widthOne) {
                    if (data.x < x + this.widthOne) {
                        sumValue += data.value;
                        sumWeight += 1;
                    } else {
                        if (data.x < x + this.widthDecreasing + this.widthOne) {
                            let q = ((x + this.widthOne + this.widthDecreasing) - data.x) / (this.widthDecreasing);
                            sumValue += (data.value * q);
                            sumWeight += q;
                        } else {
                            overInterval = true;
                        }
                    }
                } else {
                    let q = (data.x - (x - this.widthDecreasing - this.widthOne)) / (this.widthDecreasing);
                    sumValue += (data.value * q);
                    sumWeight += q;

                }
            }
        }
        if (sumWeight == 0) {
            return 0;
        }
        return sumValue / sumWeight;
    }

    getSum(x) {
        let sumValue = 0;
        let sumWeight = 0;
        let overInterval = false;
        for(let i = 0; (i<this.dataSet.length - 1) && !overInterval; i++) {
            let data = this.dataSet[i];
            if (data.x > x - this.widthOne -this.widthDecreasing) {
                if (data.x > x - this.widthOne) {
                    if (data.x < x) {
                        sumValue += data.value;
                        sumWeight += 1;
                    } else {
                        overInterval = true;
                    }
                } else {
                    let q = (data.x - (x - this.widthDecreasing - this.widthOne)) / (this.widthDecreasing);
                    sumValue += (data.value * q);
                    sumWeight += q;
                }
            }
        }
        if (sumWeight == 0) {
            return 0;
        }
        return sumValue;
    }    
}
