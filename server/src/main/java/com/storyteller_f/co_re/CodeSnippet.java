package com.storyteller_f.co_re;

import java.util.Date;

import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StoredField;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CodeSnippet {
    private String title;
    private String content;
    private Date lastModifiedTime;
    private int id;
    private String uuidString;
    public static final String titleKey = "title";
    public static final String contentKey = "code";
    public static final String lastModifiedTimeKey = "lastModified";
    public static final String uuidKey = "uuid";

    public Document get() {
        Document document = new Document();
        document.add(new StoredField(contentKey, content));
        document.add(new TextField(titleKey, title, Field.Store.YES));
        document.add(new StoredField(lastModifiedTimeKey, lastModifiedTime.getTime()));
        document.add(new StringField(uuidKey, uuidString, Field.Store.YES));
        return document;
    }

    public static CodeSnippet from(Document document, int id) {
        String t = document.get(lastModifiedTimeKey);
        Date time;
        if (t != null) {
            time = new Date(Long.parseLong(t));
        } else {
            time = null;
        }
        return new CodeSnippet(document.get(titleKey), document.get(contentKey), time, id, document.get(uuidKey));
    }
}
