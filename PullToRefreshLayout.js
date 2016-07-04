/**
 * Created by lijie on 16/6/29.
 */
'use strict'

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    View,
    PanResponder,
    LayoutAnimation,
    ProgressBarAndroid,
    Dimensions,
    Text,
    AsyncStorage,
    UIManager
} from 'react-native';


import PluImageLayout from './PluImageLayout';

let self;
/**ref的引用*/
const PULL_REFRESH_LAYOUT="pullLayout";
/**屏幕宽度*/
const deviceWidth = Dimensions.get('window').width;
/**下拉阻力系数*/
const factor=1.8;
/**最大下拉高度*/
const MAX_PULL_LENGTH=170;
/**触发刷新的高度*/
const REFRESH_PULL_LENGTH=70;
/**动画时长*/
const BACK_TIME=400;
/**存储最后刷新时间的Key*/
const REFRESH_LAST_TIME_KEY="refresh_last";
/**原生控件的引用*/
const PLU_IMAGE_KEY="plu_image_key";

const RefreshStatus={
    Refresh_NONE:0,
    Refresh_Drag_Down:1,
    Refresh_Loading:2,
    Refresh_Reset:3,
};

const ShowLoadingStatus={
    SHOW_DOWN:0,
    SHOW_UP:1,
    SHOW_LOADING:2,
};

let lastMoveY=0;

let hasMovedDistance=0;

UIManager.setLayoutAnimationEnabledExperimental(true);

class PullToRefreshLayout extends Component{

    _panResponder:{}
    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            currentDistance:0,

            pullRefreshStatus:RefreshStatus.Refresh_NONE,

            showPullStatus:ShowLoadingStatus.SHOW_DOWN,

            showPullLastTime:'NONE',
        };
        this.resetHeader=this.resetHeader.bind(this);
        this.refreshStateHeader=this.refreshStateHeader.bind(this);
        this.getTime=this.getTime.bind(this);
        this.addZeroAtFront=this.addZeroAtFront.bind(this);
    }

    //要求成为响应者
    _handleStartShouldSetPanResponder(e: Object, gestureState: Object): boolean {
        console.log("进入....startShould");
        return true;
    }
    _handleMoveShouldSetPanResponder(e: Object, gestureState: Object): boolean {
        if (gestureState.moveY>gestureState.y0){
            return true;
        }
        else{
            console.log('entry false');
            return false;
        }
    }
    //touch down 开始手势操作。给用户一些视觉反馈，让他们知道发生了什么事情！
    _handlePanResponderGrant(e: Object, gestureState: Object){

    }

    //touch move 响应滑动事件
    _handlePanResponderMove(nativeEvent: Object, gestureState: Object) {
        console.log('move.......');
        //判断当前移动距离 是否 大于可触发刷新距离
        if(self.state.currentDistance>REFRESH_PULL_LENGTH){
            //判断是否需要改变状态
            if(self.state.showPullStatus===ShowLoadingStatus.SHOW_DOWN){
                self.setState({
                    showPullStatus:ShowLoadingStatus.SHOW_UP,
                });
            }
        }
        else{
            if (self.state.showPullStatus===ShowLoadingStatus.SHOW_UP){
                self.setState({
                    showPullStatus:ShowLoadingStatus.SHOW_DOWN,
                });
            }
        }
        //是否正在刷新状态
        if (self.state.pullRefreshStatus===RefreshStatus.Refresh_Loading){
            self.setState({
                currentDistance:REFRESH_PULL_LENGTH+gestureState.dy/factor,
            });
            self.refs[PULL_REFRESH_LAYOUT].setNativeProps({
                style:{
                    marginTop:self.state.currentDistance,
                }
            });
            return;
        }
        //小于最大拉拽 长度
        if (gestureState.dy>0&&self.state.currentDistance<MAX_PULL_LENGTH){
            self.setState({
                currentDistance:gestureState.dy/factor,
                pullRefreshStatus:RefreshStatus.Refresh_Drag_Down,
            });
            self.refs[PULL_REFRESH_LAYOUT].setNativeProps({
                style:{
                    marginTop:self.state.currentDistance,
                }
            });
        }
        //大于最大可拉拽长度时, 设置可拉拽长度为 最大拉拽长度
        else if(gestureState.dy>0&&self.state.currentDistance>MAX_PULL_LENGTH){//则不再往下移动
            self.setState({
                currentDistance:MAX_PULL_LENGTH,
                pullRefreshStatus:RefreshStatus.Refresh_Drag_Down,
            });
            self.refs[PULL_REFRESH_LAYOUT].setNativeProps({
                style:{
                    marginTop:self.state.currentDistance,
                }
            });
        }
        if (lastMoveY===0){
            lastMoveY=gestureState.y0;
        }
        //到了一定长度后,让蛋壳上升
        if (gestureState.dy>90){
            //移动的距离
            let distance=gestureState.moveY-lastMoveY;
            //计算总共的移动距离
            hasMovedDistance+=distance;
            //调用原生代码移动蛋壳
            self.refs[PLU_IMAGE_KEY].shellUpward(distance);
        }
        lastMoveY=gestureState.moveY;
    }


    /**恢复头部*/
    resetHeader(){
        LayoutAnimation.configureNext({
            duration: BACK_TIME,
            update: {
                type: 'linear',
            }
        });
        self.refs[PULL_REFRESH_LAYOUT].setNativeProps({
            style:{
                marginTop:0,
            }
        });
        self.setState({
            currentDistance:0,
            pullRefreshStatus:RefreshStatus.Refresh_Reset,
            showPullStatus:ShowLoadingStatus.SHOW_DOWN,
        },()=>{

        });
        lastMoveY=0;
        self.refs[PLU_IMAGE_KEY].resetShell(MAX_PULL_LENGTH,-hasMovedDistance,BACK_TIME);
        hasMovedDistance=0;
    }
    /**正在刷新的头部*/
    refreshStateHeader(){
        self.setState({
            pullRefreshStatus:RefreshStatus.Refresh_Loading,
            currentDistance:REFRESH_PULL_LENGTH,
            showPullStatus:ShowLoadingStatus.SHOW_LOADING,
        },()=>{
            if(self.props.onRefresh){
                self.props.onRefresh();
            }
        });
        LayoutAnimation.configureNext({
            duration: BACK_TIME,
            update: {
                type: 'linear',
            }
        });
        self.refs[PULL_REFRESH_LAYOUT].setNativeProps({
            style:{
                marginTop:REFRESH_PULL_LENGTH,
            }
        });
        self.refs[PLU_IMAGE_KEY].loadingAnim();
    }

    /**处理js得到的时间,在不满10的时间前加 0 */
    addZeroAtFront(count){
        if (count<10){
            count="0"+count;
        }
        return count;
    }


    getTime(){
        let date=new Date();

        let mMonth=this.addZeroAtFront(date.getMonth()+1);

        let mDate=this.addZeroAtFront(date.getDate());

        let mHours=this.addZeroAtFront(date.getHours());

        let mMinutes=this.addZeroAtFront(date.getMinutes());

        return mMonth+"-"+mDate+"  "+mHours+":"+mMinutes;
    }

    /**完成刷新后 更新时间,恢复头部*/
    stopRefresh(){
        let savedDate=this.getTime();
        self.setState({
            showPullLastTime:savedDate,
        });
        AsyncStorage.setItem(REFRESH_LAST_TIME_KEY,savedDate,()=>{

        });
        this.resetHeader();
    }

    /**onTouchUp 事件*/
    _handlePanResponderEnd(e: Object, gestureState: Object) {
        if (self.state.currentDistance>=REFRESH_PULL_LENGTH){
            self.refreshStateHeader();
        }
        else{
            self.resetHeader();
        }
    }

    /**在组件没加载前,获取上次刷新的时间*/
    componentDidMount() {
        AsyncStorage.getItem(REFRESH_LAST_TIME_KEY,(err,result)=>{
            if (result){
                self.setState({
                    showPullLastTime:result,
                });
            }
        });
    }

    componentWillMount() {
        self=this;
        this._panResponder=PanResponder.create({
            onStartShouldSetPanResponder: this._handleStartShouldSetPanResponder,
            onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
            onPanResponderGrant: this._handlePanResponderGrant,
            onPanResponderMove: this._handlePanResponderMove,
            onPanResponderRelease: this._handlePanResponderEnd,
            onPanResponderTerminate: this._handlePanResponderEnd,
        });
    }


    /**仅有当某些状态需要刷新时,才进行render页面 */
    shouldComponentUpdate(nextProps,nextState) {
        if (nextState.showPullStatus!==self.state.showPullStatus){
            return true;
        }
        if (self.state.showPullLastTime!==nextState.showPullLastTime){
            return true;
        }
        return false;
    }



    render(){
        let pullText;
        let indicatorView=<PluImageLayout ref={PLU_IMAGE_KEY} />;
        if (this.state.showPullStatus===ShowLoadingStatus.SHOW_DOWN){
            pullText="下拉刷新";
        }
        else if (this.state.showPullStatus===ShowLoadingStatus.SHOW_UP){
            pullText="释放刷新";
        }
        else if(this.state.showPullStatus===ShowLoadingStatus.SHOW_LOADING){
            pullText="刷新中......";
        }
        return (
            <View style={styles.base}>
                <View style={{backgroundColor:'white',position:'absolute',overflow:'hidden'}}>
                    <View style={{justifyContent:'center',alignItems:'center',width:deviceWidth,height:REFRESH_PULL_LENGTH,flexDirection:'row'}}>
                        {indicatorView}
                        <View style={{height:REFRESH_PULL_LENGTH,justifyContent:'center',alignItems:'center',marginLeft:10}}>
                            <Text style={{fontSize:12,color:'#666',marginBottom:1}}>{pullText}</Text>
                            <Text style={{fontSize:12,color:'#666',marginTop:1}}>最后更新:   {this.state.showPullLastTime}</Text>
                        </View>
                    </View>
                </View>
                <View
                    ref={PULL_REFRESH_LAYOUT}
                    style={{flex:1,position:'absolute',width: deviceWidth}}  {...this._panResponder.panHandlers} >
                    {this.props.children}
                </View>
            </View>
        );
    }
}

export default PullToRefreshLayout;

var styles = StyleSheet.create({
    base: {
        flex: 1,
        position :'relative'
    },
});