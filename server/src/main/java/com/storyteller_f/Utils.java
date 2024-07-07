package com.storyteller_f;

import java.io.Closeable;
import java.io.IOException;

public class Utils {
    /**
     * 可以在作用域结束时自动回收资源
     * 
     * @param <T>   可回收资源的类型
     * @param <R>   返回值的类型
     * @param t     可回收的资源
     * @param block 对外的接口可以在安全的作用域内使用资源
     * @return 返回block 的返回值
     * @throws Exception
     */
    public static <T extends Closeable, R> R use(T t, CheckedFunction<T, R> block) throws Exception {
        try {
            return block.apply(t);
        } finally {
            try {
                if (t != null) {
                    t.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

    }
}
