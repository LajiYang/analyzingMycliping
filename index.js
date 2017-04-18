
    //将每份标注分开，放入数组中
    function fullContent(fullLabel,sourcestring) {   
        var separator = /==========/;

        separator.exec(sourcestring);
        fullLabel.push(RegExp.leftContext);

        if (RegExp.rightContext) {
            sourcestring=RegExp.rightContext;
            fullContent(fullLabel,sourcestring);
        }
    }

    function title(fullLabel) {      
        var mark = [];
        var bookTitle = new RegExp('.+(?=\\s\\(.+\\)-)');
        var authorName = new RegExp('\\(.+(?=\\)-)');
        var postionNum = new RegExp('\\)-\\s\\D+\\d+(?=-\\d+)');
        var TimeCn = new RegExp('\\|\\s添加于\\s.+:\\d\\d:\\d\\d');
        var TimeEn = new RegExp('\\|\\sAdded\\son\\s.+:\\d\\d:\\d\\d\\s\\wM');
        var num = new RegExp('\\d{1,}');
        var ctent = new RegExp('^.*$');

        for (var i = 0;i < fullLabel.length;i++) {
            var info = {};

             //书名之后的内容，包括\(,\s在内
            info.title = bookTitle.exec(fullLabel[i])[0];   
            
            //姓名之后的内容，包括)-在内
            var x = RegExp.rightContext;    
            info.author = authorName.exec(x)[0];
            
            //剔除括号
            y = info.author.split('(');  
            info.author = y[1];
            x = RegExp.rightContext; 
            info.postion = postionNum.exec(x)[0];

            //位置之后的内容，包括-xxxx（数字）在内
            x = RegExp.rightContext;

            //选出数字
            info.postion = num.exec(info.postion)[0]; 

            if (TimeEn.exec(x)) {
                info.time = TimeEn.exec(x)[0];
                x = RegExp.rightContext;

                //剔除不需要的
                y = info.time.split(' Added on ');  
                info.time = y[1];
            }else {

                info.time = TimeCn.exec(x)[0];
                x = RegExp.rightContext;

                //剔除不需要的
                y = info.time.split(' 添加于 ');  
                info.time = y[1];
            } 

            info.content = ctent.exec(x)[0];
            mark.push(info);  
        }

        time(mark);
        emptyContent(mark);
        return mark;
    }

    //将时间规范输出
    function time(mark) {   
        var months = ['January','February','March','April','May','June','July','August','September','October','November','December']; 
        var pickupYear = /\d\d\d\d/;
        var pickupMonth = /\b\w+\b(?=\s\d{1,2},\s\d\d\d\d)/;
        var pickupYue = /\d{1,2}(?=月)/
        var pickupDay = /\d{1,2}(?=,\s\d\d\d\d\s)/;
        var pickupTian = /\d{1,2}(?=日)/;
        var pickupTime = /\d{1,2}:\d\d:\d\d/
        var morn = /\S(?=午)/;
        var year;
        var month;
        var day;
        var hour;
        var x
        
        for (var i = 0;i < mark.length;i++) {
            var time = mark[i].time;
            var y;
            x = pickupMonth.exec(time);
            
            //判断是否为英文格式
            if (x) {   
                month = months.indexOf(x[0]) + 1; 

                if (month.length = 1) {
                    month = '0' + month;
                } 

                x = RegExp.rightContext;
                day = pickupDay.exec(x)[0];

                if (day.length == 1) {
                    day = '0' + day;
                } 

                x = RegExp.rightContext;
                year = pickupYear.exec(x)[0];
                x = RegExp.rightContext;
                hour = pickupTime.exec(x)[0];
                y = hour.split(':');
                x = RegExp.rightContext;
                x = x.split(' ')[1];

                //判断是上午还是下午
                if (x === 'AM') {
                     if (y[0].length === 1) {
                        y[0] = '0' + y[0];
                     } 
                }

                if (x === 'PM') {
                    y[0] = parseInt(y[0]) + 12;
                }
            }else {  
                year = pickupYear.exec(time)[0];
                x = RegExp.rightContext;
                month = pickupYue.exec(x)[0];

                if (month.length === 1) {
                    month = '0' + month;
                } 

                x = RegExp.rightContext;
                day = pickupTian.exec(x)[0];

                if (day.length === 1) {
                    day = '0' + day;
                } 

                x = RegExp.rightContext;
                hour = pickupTime.exec(x)[0];
                var y =  hour.split(':');

                //判断是上午还是下午
                if (morn.exec(x)[0] === '上') {
                    if (y[0].length === 1)  y[0] = '0' + y[0];
                }

                if (morn.exec(x)[0] === '下') {
                    y[0] = parseInt(y[0],10) + 12;
                }    
            }

            hour = y.join(':');
            mark[i].time = year + '-' + month + '-' + day + ' ' + hour;   
        }
    }

    //清除重复的书名
    function deleteRepetition(booklist) {  

        for (var i = 0;i < booklist.length - 1;i++) {

            for (var j = i + 1;j < booklist.length;j++) {

                if (booklist[i] === booklist[j]) {

                    for (var k = j;k < booklist.length - 1;k++) {
                        booklist[k] = booklist[k+1];
                    }

                    booklist.pop();
                    j--;
                } 
            }
        }

        return booklist;
    }

    //清除content为空的标注
    function emptyContent(mark) {   

        for (var i = 0;i < mark.length;i++) {

            if (! mark[i].content) {

                for (var j = i;j < mark.length - 1;j++) {
                    mark[j] = mark[j+1];
                }

                mark.pop();
            } 
        }
    }

    //获取书单
    function bookList(mark) {  
        var booklist = [];

        for (i = 0;i < mark.length;i++) {
            booklist.push(mark[i].title);
        }

        return deleteRepetition(booklist);  
    }

    //主函数
    function parseMarkTxt(sourcestring) {    
        var fullLabel=[];
        var mark;
        var booklist;
        
        fullContent(fullLabel,sourcestring);
        mark=title(fullLabel);
        booklist=bookList(mark);

        return {
            mark,
            booklist
        };

    }

    console.log(parseMarkTxt(sourcestring));
