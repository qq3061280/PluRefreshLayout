/**
 * Created by lijie on 16/7/1.
 */
'use strict';

var React = require('React');
var ReactNative = require('ReactNative');
var requireNativeComponent = require('requireNativeComponent');

var UIManager = require('UIManager');
import {
    View,
} from 'react-native';

const PK_REF_KEY="pk_ref_key";

var PluImageLayout =React.createClass({

    propTypes: {
        ...View.propTypes,
    },

    shellUpward:function(distance){
        UIManager.dispatchViewManagerCommand(
            this.getPluImageHandle(),
            1,
            [distance]
        );
    },

    loadingAnim:function () {
        UIManager.dispatchViewManagerCommand(
            this.getPluImageHandle(),
            2,
            null
        );
    },

    resetShell:function (distance,maxLength,maxTime) {
        UIManager.dispatchViewManagerCommand(
            this.getPluImageHandle(),
            3,
            [distance,maxLength,maxTime]
        );
    },

    render:function () {
        return (
            <RCTPluImageLayout
                style={{width:38,height:70,marginRight:10,marginTop:-20}}
                ref={PK_REF_KEY}
            >
            </RCTPluImageLayout>
        );
    },

    getPluImageHandle: function() {
        return ReactNative.findNodeHandle(this.refs[PK_REF_KEY]);
    },
});

var RCTPluImageLayout = requireNativeComponent('AndroidPluImageLayout', PluImageLayout);

module.exports = PluImageLayout;