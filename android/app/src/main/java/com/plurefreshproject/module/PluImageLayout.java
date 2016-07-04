package com.plurefreshproject.module;

import android.animation.Animator;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.graphics.drawable.AnimationDrawable;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.RelativeLayout;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.plurefreshproject.R;

import java.math.BigDecimal;
import java.util.Map;

import javax.annotation.Nullable;

/**
 * Created by lijie on 16/7/1.
 */
public class PluImageLayout extends ViewGroupManager<RelativeLayout> {

    private static final String REACT_CLASS="AndroidPluImageLayout";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    /**指令: 将蛋壳向上移动*/
    private static final int SHELL_UPWARD=1;
    /**指令: 加载动画*/
    private static final int LOADING_ANIM=2;
    /**指令: 还原蛋壳*/
    private static final int RESET_SHELL=3;

    /**弹力*/
    private static final int FACTOR=3;

    private ImageView iv_egg;
    private ImageView iv_shell;


    @Override
    protected RelativeLayout createViewInstance(ThemedReactContext reactContext) {
        View rootView= LayoutInflater.from(reactContext).inflate(R.layout.plu_image_layout,null);
        iv_egg= (ImageView) rootView.findViewById(R.id.iv_egg);
        iv_shell= (ImageView) rootView.findViewById(R.id.iv_shell);
        return (RelativeLayout) rootView;
    }

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.of("shell_upward",SHELL_UPWARD,"loadingAnim",LOADING_ANIM,"resetShell",RESET_SHELL);
    }

    private AnimationDrawable ad_loading;

    private double mResetTop;

    private ObjectAnimator objectAnimator;

    private int getIntValue(double d){
        BigDecimal b=new BigDecimal(d).setScale(0, BigDecimal.ROUND_HALF_UP);
        return b.intValue();
    }

    private void stopLoadingAnim(){
        if (ad_loading!=null&&ad_loading.isRunning()){
            ad_loading.stop();
            iv_shell.setVisibility(View.VISIBLE);
        }
    }

    /**蛋壳的初始高度*/
    private int mFirstTop=0;

    @Override
    public void receiveCommand(RelativeLayout root, int commandId, @Nullable ReadableArray args) {
        if (mFirstTop==0){
            mFirstTop=iv_shell.getTop();
        }
        switch (commandId){
            case SHELL_UPWARD:
                double topMargin=iv_shell.getTop();
                topMargin-=args.getDouble(0)*FACTOR;
                iv_shell.layout(iv_shell.getLeft(),getIntValue(topMargin),iv_shell.getRight(),iv_shell.getBottom());
                stopLoadingAnim();
                if (objectAnimator!=null&&objectAnimator.isRunning()){
                    objectAnimator.end();
                }
                return;
            case LOADING_ANIM:
                iv_shell.setVisibility(View.GONE);
                if (ad_loading==null){
                    ad_loading = (AnimationDrawable) root.getResources().getDrawable(R.drawable.img_anim);
                }
                iv_egg.setImageDrawable(ad_loading);
                if (!ad_loading.isRunning()){
                    ad_loading.start();
                }
                return;
            case RESET_SHELL:
                stopLoadingAnim();
                mResetTop=iv_shell.getTop();
                mResetTop-=args.getDouble(1)*FACTOR;

                /**最大长度*/double maxLength=args.getDouble(0);
                /**平均速度*/double averageSpeed=maxLength/args.getDouble(2);
                /**还原需要的时间*/double spendTime=mResetTop/averageSpeed;

                objectAnimator=ObjectAnimator.ofInt(iv_shell,"pluReset",iv_shell.getTop(),mFirstTop).setDuration((int)spendTime);
                objectAnimator.start();
                objectAnimator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
                    @Override
                    public void onAnimationUpdate(ValueAnimator valueAnimator) {
                        int value= (int) valueAnimator.getAnimatedValue();
                        iv_shell.layout(iv_shell.getLeft(),value,iv_shell.getRight(),iv_shell.getBottom());
                    }
                });
                objectAnimator.addListener(new Animator.AnimatorListener() {
                    @Override
                    public void onAnimationStart(Animator animator) {

                    }

                    @Override
                    public void onAnimationEnd(Animator animator) {
                        //在动画结束后  将蛋壳移到初始位置
                        iv_shell.layout(iv_shell.getLeft(),mFirstTop,iv_shell.getRight(),iv_shell.getBottom());
                    }

                    @Override
                    public void onAnimationCancel(Animator animator) {

                    }

                    @Override
                    public void onAnimationRepeat(Animator animator) {

                    }
                });
                return;
        }
    }
}
