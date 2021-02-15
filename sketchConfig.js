class SketchOption {

    constructor(maxWidth, maxItemHeight) {
        this.titleSize=35
        this.optionNameSize=20;
        this.title = "OPTIONS"
        this.maxWidth = maxWidth
        this.itemWidth = 75
        this.itemPadding = 10
        // console.log(maxItemHeight, "MIH")
        this.itemHeight = min(100, maxItemHeight)
        this.titlePadding = this.itemPadding;

        this.options = new Map()
        this.bounds = new Map()
        this.selections = []
        this.setOptions()
        this.setSelection()
    }
    addOption(name, value) {
        this.options.set(name, value)
    }

    getValue(name) {
        return this.options.get(name)
    }

    getAtLocation(x, y) {
        for (let [name, bound] of this.bounds) {
            if (
                x > bound.xmin && x < bound.xmax && y > bound.ymin && y < bound.ymax
            ) {
                return name
            }
        }
        return null
    }

    setSelection() {

    }

    toggleSelection(name) {
        if (!this.bounds.has(name)) {
            console.log(`OH NO! NO ${name}`)
            return
        }
        if (this.selections.includes(name)) {
            if (this.selections.length > 1) {
                this.selections = this.selections.filter(n => n != name)
            }
        } else {
            this.selections.push(name)
        }
        this.setSelection()
    }

    draw() {
        push()
        textSize(this.titleSize)
        fill(BACKGROUND)
        strokeWeight(0);
        rect(0, 0, this.maxWidth, this.titleSize)
        fill(FOREGROUND);
        text(this.title, 0, this.titleSize);
        pop()

        let currentX = 0;
        let currentY = this.titleSize + this.itemPadding;
        for (let [key, value] of this.options) {
            if (currentX >= this.maxWidth - this.itemWidth) {
                currentX = 0;
                currentY += this.itemHeight + this.itemPadding;
            }
            push()
            translate(currentX, currentY)
            if (this.selections.includes(key)) {
                push()
                fill(0, 0, 0, 0)
                strokeWeight(2)
                stroke(0, 0, 255, 255)
                rect(-this.itemPadding/2, -this.itemPadding/2, this.itemWidth + this.itemPadding, this.itemHeight + this.itemPadding)
                pop()
            }
            textSize(this.optionNameSize)
            this.drawOption(key, value, this.itemHeight - this.itemPadding - this.optionNameSize)
            // translate(100, 200)
            fill(BACKGROUND)
            strokeWeight(0)
            rect(0, this.itemHeight - this.optionNameSize, this.itemWidth, this.optionNameSize+5)
            fill(FOREGROUND)
            text(key,  0, this.itemHeight)
            pop()
            this.bounds.set(key, {
                "xmin": currentX,
                "xmax": currentX + this.itemWidth,
                "ymin": currentY,
                "ymax": currentY + this.itemHeight,
            })

            currentX += this.itemWidth + this.itemPadding
        }
        return currentY + this.itemHeight
    }
}

CS_YELLOW=["#EFB70E", "#FFDA6C", "#F8CB42", "#BB8D05", "#926E00", "#EFDB0E", "#FFF26C", "#F8E842", "#BBAA05", "#928500", "#EF8F0E", "#FFC06C", "#F8AA42", "#BB6D05", "#925400"]
CS_BLUE=["#2500F3", "#C1BFD0", "#9287CC", "#120074", "#0C004E"]
CS_GREEN=["#63D40C", "#9CE762", "#81DC3A", "#4AA504", "#388200", "#09997D", "#4CB39F", "#2A9F88", "#037760", "#005E4B", "#D5EB0D", "#EDFB6A", "#E2F440", "#A6B704", "#829000"]
CS_PURPLE=["#7F2B6D", "#EFD1E8", "#B46CA5", "#480539", "#11000D"]
CS_RED=["#FF0000", "#EECECE", "#E29D9D", "#8C0000", "#500000"]
CS_RAINBOW=["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF"]
CS_GRAYSCALE=["#040404", "#777777"]

class BgOptions extends SketchOption {

    constructor(maxWidth, maxItemHeight) {
        super(maxWidth, maxItemHeight)
        this.title = "Background Color:"
    }
    setOptions() {

        this.addOption(
            "White", ["#FFFFFF", "#000000"]
        )
        this.addOption(
            "Black", ["#000000", "#FFFFFF"]
        )
        this.addOption(
            "Grey", ["#707070", "#000000"]
        )
    }
    setSelection() {
        if (this.selections.length == 0) {
            this.selections = ["White"]
        } else if (this.selections.length > 1) {
            this.selections = [this.selections[this.selections.length - 1]]
        }
        let selection = this.selections[0]
        BACKGROUND=this.getValue(selection)[0]
        FOREGROUND=this.getValue(selection)[1]
    }

    drawOption(name, bg_fg, optionHeight) {
        let bg = bg_fg[0]
        let fg = bg_fg[1]
        fill(bg);
        rect(0, 0, this.itemWidth, optionHeight)
        fill(fg);
        text(name, 10, optionHeight/2);
    }
}


class ColorOptions extends SketchOption {

    constructor(maxWidth, maxItemHeight) {
        super(maxWidth, maxItemHeight)
        this.title = "Color:"
    }
    setOptions() {

        this.addOption(
            "Yellow", CS_YELLOW,
        )
        this.addOption(
            "Blue", CS_BLUE
        )
        this.addOption(
            "Purple", CS_PURPLE
        )
        this.addOption(
            "Green", CS_GREEN
        )
        this.addOption(
            "Red", CS_RED
        )
        this.addOption(
            "Gray", CS_GRAYSCALE
        )
        this.addOption(
            "Rainbow", CS_RAINBOW
        )
        this.selections.push("Rainbow")
    }
    setSelection() {
        COLORS=[]
        for (let name of this.selections) {
            COLORS = COLORS.concat(this.getValue(name))
        }
    }

    drawOption(name, colorscheme, optionHeight) {
        let nColors = colorscheme.length
        let colorWidth = this.itemWidth / nColors;
        let colorX = 0
        push()
        for (let i=0; i < nColors; i++) {
            fill(colorscheme[i]);
            rect(colorX, 0, colorWidth, optionHeight)
            colorX += colorWidth
        }
        pop()
    }
}


class ShapeOptionMenu extends SketchOption {

    constructor(maxWidth, maxItemHeight) {
        super(maxWidth, maxItemHeight)
        this.title = "Shape:"
    }

    setOptions() {
        this.addOption(
            "Triangle", new SoundTriangle(createVector(0, 0))
        )
        this.addOption(
            "Line", new SoundLine(createVector(0,0))
        )
        this.addOption(
            "Ellipse", new SoundEllipse(createVector(0,0))
        )
    }

    setSelection() {
        if (this.selections.length == 0) {
            this.selections = ["Triangle", "Line", "Ellipse"]
        }
        SHAPES=this.selections.map((name) => name.toUpperCase())
    }
    
    drawOption(name, shape, optionHeight) {
        push()
        let fillColor = color(BACKGROUND)
        fillColor.setAlpha(FILL_ALPHA)
        fill(fillColor)
        strokeWeight(0)
        rect(-5, 0, this.itemWidth, this.itemHeight)
        pop()
        push()
        translate(40, 30)

        shape.strokeWeight = 2
        shape.speed = createVector(0,0)
        shape.rotSpeed = .01
        shape.draw(1.5)
        shape.update()
        pop()
    }

}

class SketchOptions {

    constructor(xPct) {
        this.maxItemHeight = height /10
        this.xStart = 0; //(width * xPct)*.9
        this.maxWidth = width; //(width - this.xStart) * .9
        this.options = [
            new ColorOptions(this.maxWidth, this.maxItemHeight),
            new ShapeOptionMenu(this.maxWidth, this.maxItemHeight),
            new BgOptions(this.maxWidth, this.maxItemHeight)
        ]
        this.offsets = new Map()
    }

    draw() {
        // console.log(this.xStart)
        let offset =0
        for (let option of this.options) {
            push()
            translate(this.xStart, 0)
            let prevOffset = offset;
            translate(0, offset);
            push()
            strokeWeight(1)
            stroke(FOREGROUND)
            line(0, 0, this.maxWidth, 0)
            pop()
            offset +=option.draw() + 50
            pop();
            this.offsets.set(option, {"min": prevOffset, "max": offset})
        }
    }

    getAtLocation(x, y) {
        for (let [opt, offset] of this.offsets) {
            let selected = opt.getAtLocation(x - this.xStart, y - offset.min)
            if (selected) {
                return [opt, selected]
            }
        }
        return [null, null]
    }

    refresh() {
        this.options[1].setOptions()
    }


}

// class COLOR_OPTS() {
    
// var opts;

// function setup() {
//     colorMode(RGB, 1);
  
//     mic = new p5.AudioIn();
//     mic.start()
  
//     createCanvas(windowWidth, windowHeight);
//     opts = new SketchOptions()
// }
  
// function draw() {
//     background(1,1)
//     opts.draw()
// }  
