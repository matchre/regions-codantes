/*
 * 
 * Javascript pour le grain regions codantes
 * 
 */

rcod = {
    /** Liste des instructions */
    instructions: new Array(5),
    /** Sequence */
    sequence: '',
    /** Affichage des instructions */
    afficherInstruction: function() {
        $( "#rcod-messagesTitre" ).html("Instructions");
        $( "#rcod-messagesContenu" ).html(this.instructions[this.etape]);
    },
    /** Affiche une information */
    afficherInformation: function(text) {
        $( "#rcod-messagesTitre" ).html("Informations");
        $( "#rcod-messagesContenu" ).html(text);
    },
    afficherCorps: function(n) {
        $( "#rcod-corpsContenu > div" ).hide()
        $( '#rcod-corpsContenu > div[corps="'+n+'"]' ).show();
    },
    /** Changer d'étape */
    changerEtape: function (n) {
        this.etape = n;
        $( "#rcod-listeEtapes a" ).removeClass("rcod-etapeActuelle");
        $( "#rcod-listeEtapes a:nth-child("+n+")" ).addClass("rcod-etapeActuelle");
        switch(n) {
            case 1:
                this.initEtape1();
                break;
            case 2:
                this.initEtape2();
                break;
            case 3:
                this.initEtape3();
                break;
            case 4:
                this.initEtape4();
                break;
        }
        this.afficherInstruction();
    },
    charge1:false,
    initEtape1: function() {
        $("#rcod-corpsTitre").html("Sélection d'une CDS candidate")
        this.afficherCorps(1);
        $( "#rcod-menu" ).empty();
        if(!this.charge1) {
            this.initSequence();
            this.initOptions();
            this.zoom(Math.pow(1.5,4));
            if(this.start.pos != null)
                this.start1($('#rcod-phase_'+this.start.phase+' > div[s1][pos="'+this.start.pos+'"]'))
            if(this.stop.pos != null)
                this.stop1($('#rcod-phase_'+this.stop.phase+' > div[s2][pos="'+this.stop.pos+'"]'))
            $("#rcod-op-zoom").empty().noUiSlider({
                range: [1, Math.pow(150, 1/4)],
                start: 1.5,
                handles: 1,
                orientation: "vertical",
                slide: function(){
                    clearTimeout(rcod.timer);
                    var z = Math.pow($(this).val(),4);
                    rcod.timer = setTimeout("rcod.zoom("+z+")",200);
                }
            })
            $("#rcod-op-start").change(function() {
                rcod.changerOptions()
            });
            $("#rcod-op-stop").change(function() {
                rcod.changerOptions()
            });
            $("#rcod-op-rbs").change(function() {
                rcod.changerOptions()
            });
            this.charge1 = true;
        }
    },
    start:{
        pos:null, 
        phase:null
    }, 
    stop:{
        pos:null, 
        phase:null
    },
    start1: function(obj) {
        $("#rcod-cds-start").remove()
        this.start.pos = parseFloat(obj.attr('pos'));
        this.start.phase = obj.attr('phase');
        obj.append('<div id="rcod-cds-start"><div>'+(this.start.pos+1)+'</div></div>');
        this.verifier1();
    },
    stop1: function(obj) {
        $("#rcod-cds-stop").remove()
        $("#rcod-cds-stop").remove()
        this.stop.pos = parseFloat(obj.attr('pos'));
        this.stop.phase = obj.attr('phase');
        obj.append('<div id="rcod-cds-stop"><div>'+(this.stop.pos+1)+'</div></div>');
        this.verifier1();
    },
    verifier1: function() {
        var message;
        if(this.start.phase != this.stop.phase)
            message = 'Vos triplets <strong style="color: #3C3">START</strong> et <strong style="color: #C33">STOP</strong> ne sont pas sur la même phase. Resélectionnez l\'un des deux.'
        else if((this.start.phase > 0) == (this.start.pos > this.stop.pos))
            message = 'Votre triplet <strong style="color: #3C3">START</strong> est situé après le triplet <strong style="color: #C33">STOP</strong> dans le sens de lecture sur ce brin d\'ADN.'
        else{
            var bad = false;
            var objs = $('#rcod-phase_'+this.start.phase+' > div[s2]');
            for(var i = 0; i < objs.length ; i ++) {
                var pos = parseFloat($(objs[i]).attr('pos'));
                if(     (this.start.phase > 0 && pos < this.stop.pos && pos > this.start.pos)
                    || (this.start.phase < 0 && pos > this.stop.pos && pos < this.start.pos) )
                    bad = true;
            }
            if(bad)
                message = 'Votre CDS n\'est pas valide, car elle contient un triplet <strong style="color: #C33">STOP</strong>. Resélectionnez l\'un des deux.'
            else if(Math.abs(this.start.pos - this.stop.pos) < 300)
                message = 'Votre CDS est trop courte : elle doit comporter au moins 300 nucléotides.'
        }
        if(message) {
            this.afficherInformation(message);
            this.valide(1);
        }
        else {
            this.afficherInformation("Vous avez sélectionné une CDS candidate valide de "+Math.abs(this.start.pos - this.stop.pos)+" nucléotides.<br/><= Vous pouvez passer à l'étape suivante.")
            this.valide(2);
        }
    },
    oppose: {
        T:"A",
        A:"T",
        G:"C",
        C:"G"
    },
    couleur: {
        T:"#9F9", 
        A:"#99F", 
        G:"#FF9", 
        C:"#F99"
    },
    initSequence: function () {
        var i;
        this.sequence = this.sequence.toUpperCase();
        var obj2 = $("#rcod-seq1");
        var obj3 = $("#rcod-seq2");
        obj2.empty();
        obj3.empty();
        for(i = 0; i < this.sequence.length ; i++) {
            obj2.append('<div id="rcod-seq1-'+i+'" pos="'+i+'" style="background-color: '+this.couleur[this.sequence[i]]+'">'+this.sequence[i]+'</div>');
            obj3.append('<div id="rcod-seq2-'+i+'" pos="'+i+'" style="background-color: '+this.couleur[this.oppose[this.sequence[i]]]+'">'+this.oppose[this.sequence[i]]+'</div>');
        }
    },
    initOptions: function() {
        var i, t, phase;
        //TODO RBS
        for(phase = 1; phase <= 3 ; phase++) {
            var obj1 = $("#rcod-phase_"+phase);
            var obj2 = $("#rcod-phase_-"+phase);
            obj1.empty();
            obj2.empty();
            for(i = phase-1; i <= this.sequence.length - 3; i+=3) {
                t = this.sequence.substr(i, 3);
                if(t == "ATG") {
                    obj1.append('<div s1 phase="'+phase+'" pos="'+i+'" pos2="'+i+'"></div>');
                }
                if(t == "TAA" || t == "TAG" || t == "TGA") {
                    obj1.append('<div s2 phase="'+phase+'" pos="'+(i+3)+'" pos2="'+i+'"></div>');
                }
            }
            for(i = this.sequence.length - phase - 2 ; i >= 0; i-=3) {
                t = this.sequence.substr(i, 3);
                if(t == "CAT") {
                    obj2.append('<div s1 phase="-'+phase+'" pos="'+(i+3)+'" pos2="'+i+'"></div>');
                }
                if(t == "TTA" || t == "CTA" || t == "TCA") {
                    obj2.append('<div s2 phase="-'+phase+'" pos="'+i+'" pos2="'+i+'"></div>');
                }
            }
        }
        $(".rcod-phase div[s1]").click(function() {
            rcod.start1($(this))
        });
        $(".rcod-phase div[s2]").click(function() {
            rcod.stop1($(this))
        });
    },
    changerOptions: function() {
        $("#rcod-op-start").change(function() {
            rcod.changerOptions()
        });
        var html = "";
        if($("#rcod-op-start:checked").length == 0)
            html += ".rcod-phase div[s1] {display:none} ";
        if($("#rcod-op-stop:checked").length == 0)
            html += ".rcod-phase div[s2] {display:none} ";
        if($("#rcod-op-rbs:checked").length == 0)
            html += ".rcod-phase div[s3] {display:none} ";
        $("#rcod-style-op").html(html);
    },
    lettreVisibles: false,
    zoom: function (k) {
        var i;
        var l = $("#rcod-cds").width();
        var p = l*k/this.sequence.length;
        var scroll = ($("#rcod-cds").scrollLeft() + l/2)/$("#rcod-seq1").width();
        var html = ".rcod-seq div {width: "+p+"px;";
        if(p < 7)
            html += "text-indent: -15px;";
        html += "} .rcod-phase div {width: "+Math.ceil(3*p)+"px;}";
        $("#rcod-style-cds").html(html)
        p = $("#rcod-seq1").width()/this.sequence.length;
        $("#rcod-cds .rcod-phase").width($("#rcod-seq1").width());
        $(".rcod-phase div").each(function() {
            $(this).css("left",($(this).attr("pos2")*p)+"px");
        })
        $(".rcod-phase div.rcod-prot").each(function() {
            $(this).css("width",($(this).attr("w")*p)+"px");
        })
        
        if(this.start.pos && this.stop.pos)
            $("#rcod-cds").scrollLeft((this.start.pos + this.stop.pos)*p/2 - l/2)
        else if(this.start.pos || this.stop.pos)
            $("#rcod-cds").scrollLeft((this.start.pos + this.stop.pos)*p - l/2)
        else
            $("#rcod-cds").scrollLeft(scroll*$("#rcod-seq1").width() - l/2)
    },
    charge2: false,
    initEtape2 : function () {
        $("#rcod-corpsTitre").html("Traduction de la CDS candidate")
        this.afficherCorps(2);
        this.initCanvas()
        this.genererCDS()
        if(this.charge2m){
            $( "#rcod-menu" ).empty();
            this.chargerMenu2()
        }
    },
    lettres: new Array("G","A","C","T"),
    initCanvas : function () {
        var i,j, k;
        var obj = $("#rcod-canvas").removeLayers();
        var l = 300;
        obj.drawEllipse({
            strokeStyle: "#000",
            strokeWidth: 1,
            layer:true,
            x: l/2, 
            y: l/2,
            width: l-2,
            height: l-2
        })
        for(i = 0 ; i < 4 ; i++) {
            this.canvas2(obj, l, 0, i, this.lettres[i],[i])
            for(j = 0; j < 4 ; j++) {
                this.canvas2(obj, l, 1, 4*i+j, this.lettres[j],[i,j])
                for(k = 0; k < 4 ; k++) {
                    this.canvas2(obj, l, 2, 16*i+4*j+k, this.lettres[k],[i,j,k])
                }   
            }
        }
        var etage = 3;
        var n = 0;
        var m = "";
        for(i = 0 ; i < 4 ; i++) {
            this.canvas2(obj, l, 0, i, this.lettres[i],[i])
            for(j = 0; j < 4 ; j++) {
                this.canvas2(obj, l, 1, 4*i+j, this.lettres[j],[i,j])
                for(k = 0; k < 4 ; k++) {
                    var mm = this.molecules[this.lettres[i]+this.lettres[j]+this.lettres[k]];
                    var ii = 16*i+4*j+k;
                    if(m != mm) {
                        if(m != "") {
                            var iii = ii - n/2;
                            opts = {
                                layer:layer,
                                fillStyle: "#000",
                                x: (0.5-(0.125*etage+0.07)*Math.cos((iii)/Math.pow(4, etage)*2*Math.PI))*l, 
                                y: (0.5-(0.125*etage+0.07)*Math.sin((iii)/Math.pow(4, etage)*2*Math.PI))*l,
                                fontSize: (11)+"pt",
                                fontFamily: "Verdana, sans-serif",
                                text: m,
                                data: [Math.floor(iii/16),Math.floor(iii/4)%4,Math.floor(iii)%4],
                                click: function(layer) {
                                    rcod.canvas3(layer.data)
                                }
                            }
                            obj.drawText(opts);
                        }
                        obj.drawLine({
                            layer:true,
                            strokeStyle: "#000",
                            strokeWidth: 1,
                            x1: (0.5-0.125*(etage)*Math.cos(ii/64*2*Math.PI))*l, 
                            y1: (0.5-0.125*(etage)*Math.sin(ii/64*2*Math.PI))*l,
                            x2: (0.5-0.125*(etage+1)*Math.cos(ii/64*2*Math.PI))*l, 
                            y2: (0.5-0.125*(etage+1)*Math.sin(ii/64*2*Math.PI))*l,
                        })
                        n = 0;
                        m = mm;
                    }
                    n++;
                    var opts = {
                        layer:true,
                        x1: (0.5-0.125*(etage)*Math.cos(ii/64*2*Math.PI))*l, 
                        y1: (0.5-0.125*(etage)*Math.sin(ii/64*2*Math.PI))*l,
                        x2: (0.5-0.125*(etage+1)*Math.cos(ii/64*2*Math.PI))*l, 
                        y2: (0.5-0.125*(etage+1)*Math.sin(ii/64*2*Math.PI))*l,
                        x3: (0.5-0.125*(etage+1)*Math.cos((ii+0.25)/64*2*Math.PI))*l, 
                        y3: (0.5-0.125*(etage+1)*Math.sin((ii+0.25)/64*2*Math.PI))*l,
                        x4: (0.5-0.125*(etage+1)*Math.cos((ii+0.5)/64*2*Math.PI))*l, 
                        y4: (0.5-0.125*(etage+1)*Math.sin((ii+0.5)/64*2*Math.PI))*l,
                        x5: (0.5-0.125*(etage+1)*Math.cos((ii+0.75)/64*2*Math.PI))*l, 
                        y5: (0.5-0.125*(etage+1)*Math.sin((ii+0.75)/64*2*Math.PI))*l,
                        x6: (0.5-0.125*(etage+1)*Math.cos((ii+1)/64*2*Math.PI))*l, 
                        y6: (0.5-0.125*(etage+1)*Math.sin((ii+1)/64*2*Math.PI))*l,
                        x7: (0.5-0.125*(etage)*Math.cos((ii+1)/64*2*Math.PI))*l, 
                        y7: (0.5-0.125*(etage)*Math.sin((ii+1)/64*2*Math.PI))*l,
                        data: [i,j,k],
                        click: function(layer) {
                            rcod.canvas3(layer.data)
                        }
                    }
                    obj.drawLine(opts)
                }
            }
        }
        iii = 64 - n/2;
        opts = {
            layer:layer,
            fillStyle: "#000",
            x: (0.5-(0.125*etage+0.07)*Math.cos((iii)/Math.pow(4, etage)*2*Math.PI))*l, 
            y: (0.5-(0.125*etage+0.07)*Math.sin((iii)/Math.pow(4, etage)*2*Math.PI))*l,
            fontSize: (11)+"pt",
            fontFamily: "Verdana, sans-serif",
            text: m,
            data: [3,3,Math.ceil(iii-16*3-4*3)],
            click: function(layer) {
                rcod.canvas3(layer.data)
            }
        }
        obj.drawText(opts);
    },
    canvas2: function(obj, l, etage, i, lettre, data, couleur) {
        var opts;
        layer = couleur == null;
        if(couleur == null)
            couleur = this.couleur[lettre]
        opts = {
            layer:layer,
            fillStyle:couleur,
            strokeStyle: "#000",
            strokeWidth: 1,
            x1: (0.5-0.125*(etage)*Math.cos(i/Math.pow(4, etage+1)*2*Math.PI))*l, 
            y1: (0.5-0.125*(etage)*Math.sin(i/Math.pow(4, etage+1)*2*Math.PI))*l,
            x2: (0.5-0.125*(etage+1)*Math.cos(i/Math.pow(4, etage+1)*2*Math.PI))*l, 
            y2: (0.5-0.125*(etage+1)*Math.sin(i/Math.pow(4, etage+1)*2*Math.PI))*l,
            x3: (0.5-0.125*(etage+1)*Math.cos((i+0.25)/Math.pow(4, etage+1)*2*Math.PI))*l, 
            y3: (0.5-0.125*(etage+1)*Math.sin((i+0.25)/Math.pow(4, etage+1)*2*Math.PI))*l,
            x4: (0.5-0.125*(etage+1)*Math.cos((i+0.5)/Math.pow(4, etage+1)*2*Math.PI))*l, 
            y4: (0.5-0.125*(etage+1)*Math.sin((i+0.5)/Math.pow(4, etage+1)*2*Math.PI))*l,
            x5: (0.5-0.125*(etage+1)*Math.cos((i+0.75)/Math.pow(4, etage+1)*2*Math.PI))*l, 
            y5: (0.5-0.125*(etage+1)*Math.sin((i+0.75)/Math.pow(4, etage+1)*2*Math.PI))*l,
            x6: (0.5-0.125*(etage+1)*Math.cos((i+1)/Math.pow(4, etage+1)*2*Math.PI))*l, 
            y6: (0.5-0.125*(etage+1)*Math.sin((i+1)/Math.pow(4, etage+1)*2*Math.PI))*l,
            x7: (0.5-0.125*(etage)*Math.cos((i+1)/Math.pow(4, etage+1)*2*Math.PI))*l, 
            y7: (0.5-0.125*(etage)*Math.sin((i+1)/Math.pow(4, etage+1)*2*Math.PI))*l,
            closed: true,
            data: data,
            click: function(layer) {
                rcod.canvas3(layer.data)
            }
        }
        obj.drawLine(opts)
        opts = {
            layer:layer,
            fillStyle: "#000",
            x: (0.5-(0.125*etage+0.07)*Math.cos((i+0.5)/Math.pow(4, etage+1)*2*Math.PI))*l, 
            y: (0.5-(0.125*etage+0.07)*Math.sin((i+0.5)/Math.pow(4, etage+1)*2*Math.PI))*l,
            fontSize: (11 - 3*etage)+"pt",
            fontFamily: "Verdana, sans-serif",
            text: lettre,
            data: data,
            click: function(layer) {
                rcod.canvas3(layer.data)
            }
        }
        obj.drawText(opts);
    },
    canvas3: function(data) {
        var i;
        var obj = $("#rcod-canvas");
        var l = 300;
        var k = 0;
        for(i = 0; i < data.length ; i++ ) {
            k = 4*k + data[i];
            this.canvas2(obj, l, i, k, this.lettres[data[i]], data, "#FFF")
        }
        this.suivant2(data);
    //TODO afficher molecule
    },
    cds:"",
    traduction:"",
    genererCDS: function() {
        this.sequence = this.sequence.toUpperCase()
        if(this.start.phase > 0) {
            this.cds = this.sequence.substr(this.start.pos, this.stop.pos-this.start.pos)
        }
        else {
            this.cds = "";
            for(var i = this.start.pos - 1 ; i >= this.stop.pos ; i--) {
                this.cds+=this.oppose[this.sequence[i]];
            }
        }
        this.traduction = "";
        var obj1 = $("#rcod-candidate").empty()
        var obj2 = $("#rcod-traduction").empty()
        for(var i = 0; 3*i < this.cds.length ; i++) {
            obj1.append('<td mol="'+i+'">'+this.cds[3*i]+'</td>')
            obj1.append('<td mol="'+i+'">'+this.cds[3*i+1]+'</td>')
            obj1.append('<td mol="'+i+'">'+this.cds[3*i+2]+'</td>')
        }
        this.suivant2b(false);
    },
    suivant2: function(data) {
        var i = this.traduction.length;
        var t = this.cds[3*i]+this.cds[3*i+1]+this.cds[3*i+2]
        if(data != null && data.length == 3) {
            var seq = this.lettres[data[0]]+this.lettres[data[1]]+this.lettres[data[2]];
            if(seq == t)
                data = null;
            else if(this.molecules[t] == this.molecules[seq]) {
                data[2] = this.lettres.indexOf(this.cds[3*i+2]);
                $("#rcod-canvas").drawLayers();
                this.canvas3(data);
            }
        }
        if(data == null) {
            if(3*i < this.cds.length) {
                var text = "Traduction du codon <strong>"+(i+1)+"</strong> sur <strong>"+(this.cds.length/3)+"</strong>";
                if(i >= 4)
                    text += "<br/><= Vous pouvez passer à l'étape suivante."
                this.afficherInformation(text)
                this.traduction += this.molecules[t]
                $("#rcod-traduction").append('<td mol="'+i+'">'+this.molecules[t]+'</td>')
                $("#rcod-trad > div").scrollLeft((i-4)*51);
            }
            if(i >= 4) {
                this.valide(3);
                if(!this.charge2m)
                    this.chargerMenu2()
            }
        }
    },
    charge2m:false,
    chargerMenu2: function() {
        this.charge2m = true;
        var menu = $( "#rcod-menu" );
        menu.empty();
        menu.append( '<a href="javascript:rcod.retour2b(true)"><img src="rcod/debut.png" width="20" height="20" border="0" /></a> ');
        menu.append( '<a href="javascript:rcod.retour2b(false)"><img src="rcod/recul.png" width="20" height="20" border="0" /></a> ');
        menu.append( '<a href="javascript:rcod.suivant2b(false)"><img src="rcod/avance.png" width="20" height="20" border="0" /></a> ');
        menu.append( '<a href="javascript:rcod.suivant2b(true)"><img src="rcod/fin.png" width="20" height="20" border="0" /></a> ');
    },
    suivant2b: function(repeat) {
        var i = this.traduction.length;
        if((3*i) < this.cds.length) {
            var data = [this.lettres.indexOf(this.cds[3*i]),this.lettres.indexOf(this.cds[3*i+1]),this.lettres.indexOf(this.cds[3*i+2])]
            if(repeat)
                this.suivant2()
            else {
                $("#rcod-canvas").drawLayers();
                this.canvas3(data);
            }
            if(repeat)
                this.suivant2b(true);
        }
    },
    retour2b: function(repeat) {
        var i = this.traduction.length - 1;
        if(i > 0) {
            this.afficherInformation("Traduction du codon "+i+" sur "+(this.cds.length/3))
            $('#rcod-traduction td[mol="'+i+'"]').remove();
            $("#rcod-trad > div").scrollLeft((i-4)*51);
            this.traduction = this.traduction.substring(0, i);
            if(repeat)
                this.retour2b(true);
        }
    },
    initEtape3: function() {
        $("#rcod-corpsTitre").html("Recherche dans la base Swiss-Prot")
        this.afficherCorps(3);
        if(!this.charge2) {
            this.genererCDS()
        }
        var i = this.traduction.length;
        while(3*i < this.cds.length) {
            var t = this.cds[3*i]+this.cds[3*i+1]+this.cds[3*i+2];
            this.traduction += this.molecules[t];
            i++;
        }
        $( "#rcod-menu" ).empty();
        $("#rcod-tradfinale").val(this.traduction.substring(0, this.traduction.length-1));
    },
    protNom: "",
    suivant3: function() {
        this.protNom = $("#rcod-protNom").val();
        if(this.protNom != "") {
            var p = this.start.phase;
            var d = (p > 0) ? this.start.pos : this.stop.pos;
            var f = (p > 0) ? this.stop.pos : this.start.pos;
            this.initEtape1();
            $('#rcod-phase_'+p+' .rcod-prot[pos2="'+d+'"]').remove()
            $("#rcod-phase_"+p).append('<div class="rcod-prot" pos2="'+d+'" w="'+(f-d)+'">'+this.protNom+'</div>')
            this.valide(4);
            this.changerEtape(4);
        }
    },
    initEtape4: function() {
        $("#rcod-corpsTitre").html("Affichage de la CDS confirmée");
        this.zoom(Math.pow(1.5,4));
    },
    valide: function(n) {
        $("#rcod-listeEtapes a").each(function() {
            var i = $(this).attr('etape')
            if(i <= n)
                $(this).attr('href','javascript:rcod.changerEtape('+i+')')
            else
                $(this).removeAttr('href')
        })
    },
    fin: function() {}//TODO
}

/*
     * Liste des instructions
     */
rcod.instructions[1] = "Pour identifier une région codant, recherchez tout d'abord, sur l'une es six phases, une région située entre deux codons <strong>STOP</strong> et longue d'au moins 300 nucléotides. En faisant attention à l'orientation, sélectionnez alors le codon <strong>STOP</strong> à l'extrémité de cette région, puis le codon <strong>START</strong> qui maximise la taille de la CDS candidate.";
rcod.instructions[2] = "Visualisez la traduction de la CDS candidate en une séquence d'acides aminés en sélectionnant les triplets de nucléotides sur la roue. Vous pouvez faire apparaître la structure d'un acide aminé en cliquant sur la lettre qui le désigne dans le disque le plus extérieur.    Lorsque vous aurez traduit <strong>5 triplets</strong>, vous pourrez continuer en utilisant les boutons du cadre <strong>Traduction</strong>.";
rcod.instructions[3] = "Recherchez dans la base de protéines <strong>Swiss-Prot</strong> des séquences similaires à la votre :<ol><li>Copiez la séquence polypeptidique issue de la traduction</li><li>Accédez au serveur Swiss-Prot et copiez la séquence dans la fenêtre <strong>Accession number or sequence</strong></li><li>Choisissez Niceblast dans la liste Output Format</li><li>Cliquez sur le bouton Run BLAST et attendez le retour de l'execution du programme</li><li>Copiez le nom de la protéine dont la séquence ressemble le plus à la votre, revenez dans cette fenêtre et collez ce nom dans le champ prévu à cet effet. Si la recherche a échoué, retournez à la première page et sélectionnez une autre cds candidate.</li><li>Cliquez sur Valider</li></ol>";
rcod.instructions[4] = "Vous pouvez chercher d'autres CDS en recommençant les différentes étapes.";

/*
     * Sequence
     * >BASU_285000_291000
     */
rcod.sequence = "tttaaaagaaaatccgcacatccagttctttaacgactatcgcggatatgtccgctgtacagtgacgcctcaccaagtggaaagccgattatcgggtgatgccatttgtgaccgagccgggcgcagccatttccacgcgggcttcattcgtttaccagaaagaccaaaccgggttgagaaaggtatcatccacaacaatccaaggcggggtgaagcaatccgatgaggtcgaagaggatcgtttcttttcgcacaacaaagcccacgaaaaacaaatgattaagaagcgtgcaaaaatcacgaattaaggagtggaaattatgttttcaaacattggaataccgggcttgattctcatcttcgtcatcgccattattatttttggcccttccaagctgccggaaatcgggcgtgccgcgaaacggacactgctggaatttaaaagcgccacaaaatcacttgtgtctggtgatgaaaaagaagagaaatcagctgagctgacagcggtaaagcaggacaaaaacgcgggctgaatgctgatgaggcagacaccgggtctgcctctttttttatgaaagggagggcttttttgaatggataaaaaagaaacccatctgatcgggcatttagaagagcttcgccgccggattatcgtcacccttgcggcattttttctatttctcatcacggcttttttgttcgtacaggacatttatgactggctgatcagggatttggatggaaagctggctgtgctaggaccgagtgaaatcctctgggtgtatatgatgctttccggcatttgtgccattgcggcttctatccctgttgccgcgtaccagctgtggcgtttcgttgcaccggcgctgactaaaacggagcgcaaggtgacgatcatgtacatcatgtacataccaggtttatttgcgttgtttttggcgggcatctccttcggatactttgtcttgtttccgatcgtgctcagctttttgactcatttatcctccggccactttgaaacgatgtttacggctgaccgctactttaggtttatggtgaatttgagcctgccgttcggcttcttgtttgagatgcccttggtggtgatgtttttaacaaggctgggcatcttaaatccttacagactggccaaagcgagaaagctttcctattttctgctgattgtcgtgtccatattgattacaccgcctgattttatttctgattttctcgtgatgatcccgcttcttgtcctgtttgaagtgagtgtcaccctatcggcgtttgtctacaaaaagaggatgagggaagaaacagcggcggccgcttagtgcagcgtaccacccggtgacttcacatcctcatcatattgtgcggccgtaacagcggcgattctcaatgcccggacaatcgtgtccaggctgaggctcggcgctgttttgtcgattgtttgctgcggaatgtaaggaatatgaataaaaccgccgcgaatgtgtggggatgtccggctaatgtgatccattaacccgtagaacaaatagttgcatacaaaggtccccgctgtgtaggaaaccgcagctggaatgccgtgttccttcatcttagcagtcattcgtttcacgggaagccttgtccagtaagcggcgggcccatctggagaaatctcttcatcaatcggctgatgtccttcgttatcggggattcgcgcatctgcaaggttgattgccactcgttccggtgtaatctgcatccgtcctcctgcttggccgacacaaattacgatatctggctgatgtttttgaatggcttggcgcagagtgtccagagcggatctaaagacggttggaatttgttccgctgtaataatggcttcttctgtctcgaagccattaagccgtttcgccgcttcccatgatggattgacggtttctttgtcaaaagggtcaaagcctgtgatcagcactttttttctcatactcccatctcctttttcttttattctattgtttatttatgggtttttcatcaaaataatgtaaaggagtgaatcataatggagcatttgccggagcagtatcgccagttattcccaaccttgcagacgcatacgatgcttgccagctgttctcagagcgcattggcagagcctgtatcaagggcgatccaggattattatgatagcctgctgtataaagggacgaactggaaagaagcgattgaaaaaacagagtttgcgagaaacgagtttgcaaagctgatcggggctgaaccggatgaagtggcgattgtgccgtcagtttctgatgcactggtttctgtagcatcgtacttaactgcatttggaaagaagcacgttgtatatacagatatggattttccggcggtgcctcatgtttggcaggcacactccgattataccgtatccgtcattccatcaatagacggcgtgctgccgcttgaacaatatgaaacgcatatttcggatgaaacagtactgacgtgtgttcctcacgttcattatcgtgacggctatgttcaggatataaaagcgattgccgagatttctcagagaaagggctctttattgtttgtagatgcttatcaatcagccgggcatattcccattgatgtgaaggaatggggcgtagatatgctggcagcaggcacccggaagtatttgctcggcataccgggtgtggcgtttctttatgtgagaaaggagctggctgacgcactgaagccgaaagcatcagcttggttcggaagagagagcggatttgatggggcttatgcaaaagtcgcgcgccgttttcaaacgggcaccccagcttttatcagcgtatacgcagctgcagcggctttatcgctgctgaatcatattggggtttctcatatcagggatcatgtgaaaacgatctgtgccgatgcagttcaatatgccgctgaaaaaggcctgcagctggcggcggcacaaggtgggattcagccgggcatggttgcgatccgggatgagcgggcatcggaaacggcggggttgctgaagaagaaaaaagtgatttgcgcgccgcgggaaaatgttatccgtctcgctccccatttttataatacgaaggaggaaatgcggcacgcgattgatgaaatcgcggcgaaaacgatccacaagtaaacatgaaaaagcccctgaacactagtcaggggcttttcatattaatgatctactttaacgcgtttcataaagaaagcgccaattaaaccgataatggcaacaatcattgcaaacacaaatgcgtgctgtacgcctgctgtcaaagcttgcgggatgactgccggatcggcagggtttttaactgtactcatataatcatgctggcctgcagccataatgctgaccgcaaccgctgttccgatagcgccggccatttgctgcagcgtgttcataatggcggtgccgtctggataaaattcacgcggcagttggtttaaaccgtttgtctgtgcaggcatcatgatcatagaaatcccgatcatcaagcaggtgtgcaggatgataatcagcacagctgttgaagtggtcgtgacatttgagaagaaccatagtacaacggtgacaatcacaaatcccggaatgacaagccatttcggcccgtatttatcgaacaagcggcctgtaacaggggacataaatccatttaaaataccgcccggcaagagaacaagaccagatgcaaatgcagtgaggactaagccgccttgcagatacatcggcagaagcagcatagatgacagaatgaccatcatacaaatgaacaccatgatcacacccaaaataaacatcgggtatttgaacgcacggaggttcatcataggctgcttcattgtcagctggcggattgaaaataagataaggccgacaacgccgacaatcagcgacacgataacagtcgggctggaccatcccccggagccttcacccgcgttgctgaatccgaatacaatgccgccgaagccaatcgtcgacaggatgatagacaatacatcgattttcggctttgtcgtttcagatacattttgcatatatgcgataccgaaaacaagcgccagcacaaggaatggaagagagatccagaaaatccagtgccagttgagatgctccagaaccaatcctgagaaagttgggccgatggcgggcgcgaacataatgacaagcccgatcgttcccattgcggcaccccgtttatgaggcgggaaaatcaccaagattgtgttaaacatcagcggcagtaaaagaccggttccaagtgcctgaacgatccttgccgctaataaaaacgagaagctcggcgcaagcgccgcaatgaatgtacctaaaattgaaaagataagtgacacggtaaaaagctgtcttgttgtgaaccactgcaacagcagtcctgaaacaggaacaaggataccgagtacaagcaggtagcccgtcgttaaccattggacggttgccgctgtaatgttcaattccttcataaggtcggttaacgcaatattcagcgctgtttcactgaacatgccgataaaaccggccaacagcaaggaaatcataatcggcatcactttgtattgctgagatgctttagctgttgtttccaaaatcatttcccctctctatcaactgcatgtagtatgtcgttttttttatctcttcagcaggtcaggaatgcagctggagatatgaaggagcggcgtactgttttttgccgtcaaagataaaaggatgccgccttcaatcatcgcgttaaccacagtgctggcttcttttgcacggctctcgctgcagccagtctgccgcagtttttcctcatacacagaggcccattctttgtaggcttcatgacaggcttcgcgcaacggttcgcttttcaatgacgtctcagccgctagcaagcccacaggcaagccttcaatgtcttccgtacatgaaaactggcaggagagctccttcaaaaaggcttgaatgccttccgctggatcggtgcaggcttccatgcagtccgcgattttctgacggatatactccttcatctcattcacggcttcgatcgcaagctgttctttacccccgggaaagtggtagtaaagagagcctttaggcgcgccgctttcctttataatctggttcagccccgtgccgtaatacccttgcagctgaaaaagccgggtagctgccgaaaggattttctcacgggaatctccataactcataacattcccaccttactgaattgcaatcaaaaatatagtgactggtctattatcttgattcaatcatcaattgtcaagaaaaattcattgtatgaaaagacaaaaaaagaaggatatgacaacaaaaaatactgagagaaaagctgactgatcttttgactgaatagataaaatgtacaatgattaatcatcatatggatgtaaggagagaaatagatgaaaaaacaacgaatgctcgtactttttaccgcactattgtttgtttttaccggatgttcacattctcctgaaacaaaagaatccccgaaagaaaaagctcagacacaaaaagtctcttcggcttctgcctctgaaaaaaaggatctgccaaacattagaattttagcgacaggaggcacgatagctggtgccgatcaatcgaaaacctcaacaactgaatataaagcaggtgttgtcggcgttgaatcactgatcgaggcagttccagaaatgaaggacattgcaaacgtcagcggcgagcagattgttaacgtcggcagcacaaatattgataataaaatattgctgaagctggcgaaacgcatcaaccacttgctcgcttcagatgatgtagacggaatcgtcgtgactcatggaacagatacattggaggaaaccgcttattttttgaatcttaccgtgaaaagtgataaaccggttgttattgtcggttcgatgagaccttccacagccatcagcgctgatgggc";
rcod.molecules = {
    GGG: "G",
    GGA: "G",
    GGC: "G",
    GGT: "G",
    GAG: "E",
    GAA: "E",
    GAC: "D",
    GAT: "D",
    GCG: "A",
    GCA: "A",
    GCC: "A",
    GCT: "A",
    GTG: "V",
    GTA: "V",
    GTC: "V",
    GTT: "V",
    AGG: "R",
    AGA: "R",
    AGC: "S",
    AGT: "S",
    AAG: "K",
    AAA: "K",
    AAC: "N",
    AAT: "N",
    ACG: "T",
    ACA: "T",
    ACC: "T",
    ACT: "T",
    ATG: "M",
    ATA: "I",
    ATC: "I",
    ATT: "I",
    CGG: "R",
    CGA: "R",
    CGC: "R",
    CGT: "R",
    CAG: "Q",
    CAA: "Q",
    CAC: "H",
    CAT: "H",
    CCG: "P",
    CCA: "P",
    CCC: "P",
    CCT: "P",
    CTG: "L",
    CTA: "L",
    CTC: "L",
    CTT: "L",
    TGG: "W",
    TGA: "*",
    TGC: "C",
    TGT: "C",
    TAG: "*",
    TAA: "*",
    TAC: "Y",
    TAT: "Y",
    TCG: "S",
    TCA: "S",
    TCC: "S",
    TCT: "S",
    TTG: "L",
    TTA: "L",
    TTC: "F",
    TTT: "F" 
}