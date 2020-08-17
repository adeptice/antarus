<template lang="html">
  <div id="screen">
    <div id="viewport">

      <header>
        <div class="container">
          <img src="/img/Antarus.svg" alt="Antarus" id="Logotype">
        </div>
      </header>

      <main>
        <div id="splashscreen" :class="{'active': showSplash}">
          <div>
            <p v-for="(message, index) in splash_messages" :key="index" v-html="message"></p>
          </div>
        </div>
        <div v-for="(slide, slide_index) in actualView.slides" :key="slide_index" class="slide" :class="slideClass(slide_index)">
          <div class="container">
            <h1>{{slide.header}}</h1>
            <div class="row">
              <div v-for="(column, col_index) in slide.columns" :key="col_index" :class="column.class">

                <template v-for="(element, el_index) in column.elements">
                  <colswitch v-if="element.colswitch" :view="element.colswitch" :elems="column.elements" :idList="idList" :result="result" :key="el_index" @clicked="saveResult"/>
                  <multibutton v-if="element.button" :model="idList[element.button.id]" :view="element.button" :result="result[idList[element.button.id].change]" :key="element.button.id" @clicked="saveResult"></multibutton>
                  <div v-if="element.div" :key="element.div.class" :class="element.div.class" v-html="element.div.content"></div>
                </template>

                <div v-for="form in column.forms" :key="form.header" class="form">
                  <h2>{{form.header}}</h2>
                  <paneswitch v-if="form.paneswitch" :params="form.paneswitch" :fields="form.fields" :idList="idList" :result="result" @filled="saveResult"></paneswitch>
                  <inputline v-for="field in form.fields" :key="field.id" :model="idList[field.id]" :view="field" :results="result" @filled="saveResult"></inputline>
                </div>

              </div>
            </div>
          </div>
        </div>
        <resultpage :class="slideClass(total_slides)" :view="server_response" :layout="view.result" @selectproposal="setProposal"></resultpage>
      </main>

    </div>
    <navigation :slides="menuList" :current="current_slide" :download="download_link" :next="nextButton" @slide="gotoSlide"></navigation>
  </div>
</template>

<script>
  // Компоненты
  import navigation from './components/navigation.vue';
  import multibutton from './components/multibutton.vue';
  import inputline from './components/inputline.vue';
  import colswitch from './components/switch.vue';
  import paneswitch from './components/paneswitch.vue';
  import resultpage from './components/resultpage.vue';

  export default {
    name: 'app',
    components: { multibutton, inputline, navigation, resultpage, colswitch, paneswitch },
    data(){
      return {
        model: {},
        server: "",
        server_response: {},
        server_pending: [],
        view: {},
        result: {},
        current_slide: 0,
        splash_messages: [],
        download_link: "",
        sentData: ""
      }
    },
    created() {
      // при создании загружаем первоначальные данные:
      // модель формы
      this.loadData('/data/config.json').then( response => {
        if (response) { this.model = response.model; this.server = response.server }
      });
      // разметку формы
      this.loadData('/data/layout.json').then( response => {
        if (response) this.view = response.view;
      });
    },
    computed: {
      isData(){
        if (this.isEmptyObject(this.model)) return false
        if (this.isEmptyObject(this.view)) return false
        return true
      },
      total_slides(){
        if (this.isData) return this.view.slides.length
        return 0
      },
      showSplash(){
        if (this.server_pending.length > 0) return true
        return false
      },
      // список слайдов для меню навигации
      menuList(){
        if (this.isData){
          var slideList = [];
          this.view.slides.forEach( slide => { slideList.push(slide.menu_name) });
          return slideList
        }
        return []
      },
      // пакет данных для кнопки следующего шага (наименование, статус активности)
      nextButton(){
        if (this.isData && (this.current_slide < this.total_slides)){
          var $cur_slide = this.view.slides[this.current_slide],
              isActive = true,
              nextText = "Следующий шаг";

          if ($cur_slide && $cur_slide.next_condition) {
            $cur_slide.next_condition.forEach( condition => {
              if ((!this.result[condition])||(this.result[condition].toString().length === 0)) isActive = false;
            });
            nextText = $cur_slide.next_name;
          }
          return ({"name": nextText, "isActive": isActive });
        }
        return {}
      },
      // список всех элементов формы по id, их роли, значения, условия отображения (из модели)
      idList(){
        var variants = {};
        // Перебираем все названия полей исходящих данных
        for (var result_name in this.model){
          // Запоминаем принцип записи в данное поле
          for (var role in this.model[result_name]) {
            // Если варианты поля — кнопки
            if (Array.isArray(this.model[result_name][role])){
              // для каждого варианта
              this.model[result_name][role].forEach( variant => {
                // привязываем к id его роль, значение, название поля исходящих данных и условие отображения (если есть)
                var variantProperties = {"role": role, "value": variant.value, "change": result_name};
                if (Object.prototype.hasOwnProperty.call(variant, "condition")) Object.assign(variantProperties, {"condition": variant.condition});
                Object.assign(variants, {[variant.id]: variantProperties})
              });
            // Если варианты поля — input и переключатели
            } else {
              // привязываем к id его роль, метку, название поля исходящих данных и условие отображения (если есть)
              var variant = this.model[result_name][role];
              var inputProperties = {"role": role, "label": variant.label, "change": result_name};
              if (Object.prototype.hasOwnProperty.call(variant, "required"))  Object.assign(inputProperties, {"required": true});
              if (Object.prototype.hasOwnProperty.call(variant, "condition")) Object.assign(inputProperties, {"condition": variant.condition});
              Object.assign(variants, {[variant.id]: inputProperties})
            }
          }
        }
        return variants
      },
      // разметка формы с исключением элементов по условию отображения
      actualView(){
        if (this.isData) return this.activeObjects(this.view);
        return {}
      },
      // финальный пакет результатов с заменой id на значения
      valueResult(){
        var newResult = {}
        for (var outVar in this.result){
          if (Array.isArray(this.result[outVar])){
            var newValues=[];
            this.result[outVar].forEach(result => {
              if (this.idList[result]) {
                newValues.push(this.idList[result].value);
              } else {
                newValues.push(result);
              }
            });
            newValues.sort();
            Object.assign(newResult,{[outVar]: newValues});
          } else {
            if (this.idList[this.result[outVar]]) {
              Object.assign(newResult,{[outVar]: this.idList[this.result[outVar]].value})
            } else {
              Object.assign(newResult,{[outVar]: this.result[outVar]})
            }
          }
        }
        return newResult
      }
    },
    methods: {
      // контроллер загрузки данных
      async loadData(path){
        const token = Math.random().toString(36).substr(2);
        this.$set(this.server_pending, this.server_pending.length, token);
        try {
          let response = await this.$http.get(path);
          console.log('loadData: '+ path);
          // console.log(response);
          if (response.data) {
            this.$delete(this.server_pending, this.server_pending.indexOf(token));
            return Object.assign(response.data, {"token": token})
          }
        } catch (ex) {
          this.$set(this.splash_messages, this.splash_messages.length, "Ошибка загрузки: " + path);
        }
        return false
      },
      // контроллер отправки данных
      async sendData(path, data){
        const token = Math.random().toString(36).substr(2);
        const http_config = {
          headers: {
            'Authorization': 'Basic ' + btoa('Antarus:Antica'),
            'ibsession': 'start'
          }
        };
        this.$set(this.server_pending, this.server_pending.length, token);
        try {
          let response = await this.$http.post(path, data, http_config);
          console.log('sendData: '+ path);
          console.log(response);
          if (response.data) {
            this.$delete(this.server_pending, this.server_pending.indexOf(token));
            return Object.assign(response.data, {"token": token})
          }
        } catch (ex) {
          this.$set(this.splash_messages, this.splash_messages.length, ex);
        }
        return false
      },
      // Проверка на пустой объект
      isEmptyObject(obj){
        for (var i in obj) { if (Object.prototype.hasOwnProperty.call(obj, i)) return false }
        return true
      },
      // формируем новую разметку по исполнению условий отображения, фильтруем результаты
      activeObjects(property){
        if (typeof property === "object"){
          if (Array.isArray(property)) {
            var layerArray = []
            property.forEach( child => {
              var answer = this.activeObjects(child);
              if ((answer.id)&&(!this.isIdActive(answer.id))) { this.deleteResultById(answer.id); return false}
              if ((answer.link_id)&&(!this.isIdActive(answer.link_id))) return false;
              if (answer != false) layerArray.push(answer);
            });
            if (layerArray.length > 0) return layerArray;
            return false
          } else {
            var layerObject = {};
            for (var key in property){
              var answer = this.activeObjects(property[key]);
              if ((answer.id)&&(!this.isIdActive(answer.id))) { this.deleteResultById(answer.id); return false}
              if ((answer.link_id)&&(!this.isIdActive(answer.link_id))) return false;
              Object.assign(layerObject, {[key]: answer});
            }
            if ((layerObject.elements === false)||(layerObject.fields === false)) return false;
            return layerObject
          }
        } else { return property }
      },
      // проверка элемента (id) на исполнение условий отображения
      isIdActive(id){
        var isActive = true;
        if (this.idList[id].condition) {
          this.idList[id].condition.forEach( condition => {
            var outVar = Object.keys(condition)[0],
                isFound = false;
            if (this.valueResult[outVar]){
              if (Array.isArray(this.valueResult[outVar])){
                if (this.valueResult[outVar].indexOf(condition[outVar]) > -1) isFound = true;
              } else {
                isFound = (this.valueResult[outVar] == condition[outVar]);
              }
              if (!isFound) isActive = false;
            }
          })
        }
        return isActive
      },
      // удаление результатов предоставляемых конкретным элементом по id
      deleteResultById(id){
        if (this.idList[id].role === "switch") {
          this.$delete(this.result, this.idList[id].change);
        } else {
          for (var outVar in this.result){
            if (Array.isArray(this.result[outVar])){
              this.result[outVar].forEach((result, index) => { if (id === result) this.$delete(this.result[outVar], index) });
            } else {
              if (id === this.result[outVar]) this.$delete(this.result, outVar);
            }
          }
        }
      },
      // определяет класс выбранного слайда
      slideClass(index){
        return (index < this.current_slide) ? "checked" : (index === this.current_slide) ? "active" : false
      },
      // контроллер входящих данных из компонентов
      saveResult(result_name, value, role){
        if (role === "checkbox"){
          if (Object.prototype.hasOwnProperty.call(this.result, result_name)){
            var index = this.result[result_name].indexOf(value);
            if (index > -1) {
              this.$delete(this.result[result_name], index)
            } else {
              this.$set(this.result[result_name], this.result[result_name].length, value);
            }
          } else { this.$set(this.result, result_name, [value]) }
        } else {
          if ( (value === null) && (Object.prototype.hasOwnProperty.call(this.result, result_name)) ) {
            this.$delete(this.result, result_name)
          } else {
            this.$set(this.result, result_name, value)
          }
        }
      },
      // при выборе предложения устанавливает ссылку для скачивания
      setProposal(path){
        if (path.length > 0) this.download_link = path;
      },
      // контроллер смены слайдов
      gotoSlide(num) {
        if (num === this.total_slides) {
          var dataToSend = JSON.stringify(this.valueResult);
          console.log('Sending data');
          console.log(dataToSend);
          if (this.sentData != dataToSend) {
            this.server_response = {};
            // this.sendData('http://10.1.29.40/krow46/hs/Antarus/', dataToSend)
            this.loadData('/data/results.json')
            .then( response => { if (response) { this.server_response = response; this.sentData = dataToSend } });
          }
        }
        this.current_slide = num;
      }
    }
  }
</script>
