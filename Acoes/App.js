/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TouchableOpacity, Vibration, ToastAndroid } from 'react-native';
import Torch from 'react-native-torch';
import BackgroundTask from 'react-native-background-task';

import {
  accelerometer,
  setUpdateIntervalForType,
  SensorTypes
} from "react-native-sensors";

import { map, filter, bufferTime, min } from "rxjs/operators";

const Value = ({ name, value }) => (
  <View style={styles.valueContainer}>
    <Text style={styles.valueName}>{name}:</Text>
    <Text style={styles.valueValue}>{new String(value).substr(0, 8)}</Text>
  </View>
)

type Props = {};

BackgroundTask.define(() => {
  console.log("Iniciando task");
  /*let interval = setInterval(() => {
    console.log('Hello from a background task');
  }, 1000);
  setTimeout(() => {
    console.log("Limpando intervalo =D");
    clearInterval(interval);
  }, 10000);*/
  Torch.switchState(true);
  console.log("Terminando task =D");
  BackgroundTask.finish();
});

export default class App extends Component<Props> {


  repeticoes = 0;
  tolerancia = 0;
  mudou = 0;
  gravando = false;
  gravado = [];

  constructor(props) {
    super(props);
    this.state = { isTorchOn: false }
  }

  componentDidMount() {
    
  }

  async checkStatus() {
    const status = await BackgroundTask.statusAsync()
    
    if (status.available) {
      // Everything's fine
      return
    }
    
    const reason = status.unavailableReason
    if (reason === BackgroundTask.UNAVAILABLE_DENIED) {
      Alert.alert('Denied', 'Please enable background "Background App Refresh" for this app')
    } else if (reason === BackgroundTask.UNAVAILABLE_RESTRICTED) {
      Alert.alert('Restricted', 'Background tasks are restricted on your device')
    }
  }
  

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity underlayColor="rgba(0,0,0,1)" style={styles.butao} onPress={() => {
          ToastAndroid.show('A task não está pronta ainda...', ToastAndroid.SHORT);

    BackgroundTask.schedule();
    this.checkStatus();
    console.log("INICIANDO TASK POR BOTAO");
        }}>
          <Text style={styles.textu}>Iniciar Task Captação de movimentos</Text>
        </TouchableOpacity>
        <TouchableOpacity underlayColor="rgba(0,0,0,1)" style={styles.butao} onPress={() => {this.iniciarCaptacaoMovimento() }}>
          <Text style={styles.textu}>Iniciar Captação de movimentos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  iniciarCaptacaoMovimento () {
    this.iniciarCaptacaoLanterna();
    ToastAndroid.show('A captação de movimentos foi iniciada. Faça o teste!', ToastAndroid.SHORT);
  }

  iniciarCaptacaoLanterna() {
    var subscription = accelerometer.pipe(
      bufferTime(300))
      .subscribe((values) => {
        this.verificarMovimentoLanterna(values)
      });
  }

  verificarMovimentoLanterna(values) {
    if (values[0] !== undefined) {
      console.log("Valores:", Math.max.apply(Math, values.map(function(o) { return o.x; })) - Math.min.apply(Math, values.map(function(o) { return o.x; })));

      var valoresEixoX = values.map(function(o) { return o.x; });
      var valorMaximoEixoX = Math.max.apply(Math, valoresEixoX);
      var valorMinimoEixoX = Math.min.apply(Math, valoresEixoX);

      if (valorMaximoEixoX - valorMinimoEixoX > 90) {
        console.log("Repeticoes: " , this.repeticoes);
        this.repeticoes++;
        if (this.repeticoes < 2)
          return;
        this.repeticoes = 0;
        this.mudou++;
        Vibration.vibrate(500);
        Torch.switchState(!this.state.isTorchOn);
        this.setState({ isTorchOn: !this.state.isTorchOn });
      }
      else {
        this.tolerancia++;
        if(this.tolerancia > 3) {
          this.repeticoes = 0;
          console.log("zerou");
        }
      }

    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  headline: {
    fontSize: 30,
    textAlign: 'center',
    margin: 10,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  butao: {
    margin: 10,
    padding: 10,
    backgroundColor: "#6200EE"
  },
  textu: {
    color: "white"
  },
  valueContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  valueValue: {
    width: 200,
    fontSize: 20
  },
  valueName: {
    width: 50,
    fontSize: 20,
    fontWeight: 'bold'
  },
});
