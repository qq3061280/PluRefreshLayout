/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    UIManager,
    TouchableOpacity,
    LayoutAnimation,
    Navigator,
    BackAndroid,
    PanResponder,
    ListView,
    Image,
} from 'react-native';

var PK_GGVIEW = 'pkggview';

import PullToRefreshLayout from './PullToRefreshLayout';

var ds = new ListView.DataSource({
    rowHasChanged: (row1, row2) => row1 !== row2,
});


let t1={
    startPoint:'上海',
    endPoint:'豪州市利辛县',
    trafficlineName:'武方物流',
    exchangeCount:4,
    trafficHour:72,
    pickUpAddress:'上海市徐家汇九星市场'
};

class PluRefreshProject extends Component {
// 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            trafficlineList:[
                t1,
                t1,
            ]
        };
        this._onRefresh=this._onRefresh.bind(this);
        this._renderRow=this._renderRow.bind(this);
    }

    _onRefresh(){
        setTimeout(()=>{
            var tmpList=this.state.trafficlineList;
            tmpList.push(t1);
            this.setState({
                trafficlineList:tmpList,
            });
            this.refs[PK_GGVIEW].stopRefresh();
        },1200);
    }


    _renderRow(item,sectionID,rowID){
        return (
            <View style={{height:150,margin: 4,borderWidth:1,borderColor:'white',elevation:1,backgroundColor:'white'}}>
                <View style={{flexDirection:'row'}}>
                    <Image
                        source={require('./img/ic_tuijian.png')}
                        style={{width:30,height:40,marginLeft:8}}
                        resizeMode={Image.resizeMode.contain}
                    />
                    <View style={{flex:1,alignSelf:'center',marginLeft:10,flexDirection:'row',alignItems:'center'}}>
                        <Text style={{fontSize:16,marginRight:6}}>{item.startPoint}</Text>
                        <Image
                            style={{width:20,height:10}}
                            source={require('./img/ic_trafficeline_to.png')}
                            resizeMode={Image.resizeMode.contain}
                        />
                        <Text style={{fontSize:16,marginLeft:6}}>{item.endPoint}</Text>
                    </View>
                    <Image
                        style={{width:13,height:13,alignSelf:'center',marginRight:4}}
                        source={require('./img/ic_trafficline_time.png')}
                        resizeMode={Image.resizeMode.contain}
                    />
                    <Text style={{alignSelf:'center',fontSize:12,marginRight:6}}>{item.trafficHour}小时</Text>
                </View>
                <View style={{height:0.6,backgroundColor:'#dedede',marginTop:8,marginBottom:8}}></View>
                <View style={{flexDirection:'row'}}>
                    <View style={{flex:1,marginLeft:8}}>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Text style={{fontSize:16,marginRight:8}}>{item.trafficlineName}</Text>
                            <Image
                                style={{width:16,height:16,marginRight:4}}
                                source={require('./img/ic_t_bao.png')}
                                resizeMode={Image.resizeMode.contain}
                            />
                            <Image
                                style={{width:16,height:16,marginRight:4}}
                                source={require('./img/ic_t_bao.png')}
                                resizeMode={Image.resizeMode.contain}
                            />
                            <Image
                                style={{width:16,height:16,marginRight:4}}
                                source={require('./img/ic_t_bao.png')}
                                resizeMode={Image.resizeMode.contain}
                            />
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center',marginTop:8}}>
                            <Text style={{fontSize:13}}>月成交</Text>
                            <Text style={{fontSize:13,color:'red',marginLeft:4,marginRight:4}}>{item.exchangeCount}</Text>
                            <Text style={{fontSize:13,marginRight:8}}>笔</Text>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center',marginTop:8}}>
                            <View style={{borderWidth:1,borderColor:'red',marginRight: 6}}>
                                <Text style={{fontSize:13}}>自提点</Text>
                            </View>
                            <Text style={{fontSize:14}}>{item.pickUpAddress}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    render() {
        var item=<ListView
                    initialListSize={1}
                    dataSource={ds.cloneWithRows(this.state.trafficlineList)}
                    renderRow={this._renderRow}
                    style={{backgroundColor:'#EEEEEE'}}
                />;
        var header= <View style={{height:60,backgroundColor:'#fe5722',justifyContent:'center',paddingTop:14,elevation:2}}>
                        <Text style={{flex:1,color:'white',fontSize:16,textAlign: 'center',textAlignVertical:'center'}}>查询运价</Text>
                    </View>;

        return (
            <View style={{flex:1}}>
                {header}
                <PullToRefreshLayout ref={PK_GGVIEW} style={styles.container}  onRefresh={this._onRefresh} >
                    {item}
                </PullToRefreshLayout>
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
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
});

AppRegistry.registerComponent('PluRefreshProject', () => PluRefreshProject);
