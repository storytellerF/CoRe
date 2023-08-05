package com.storyteller_f.co_re;
import java.util.List;

public class Response<T> {
    public long total;
    public int start;
    public List<T> data;

    public Response(List<T> data, int start, long total) {
        this.data = data;
        this.start = start;
        this.total = total;
    }
}