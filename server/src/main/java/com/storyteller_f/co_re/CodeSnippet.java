package com.storyteller_f.co_re;

import java.util.Date;

import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.FieldType;
import org.apache.lucene.document.LongPoint;
import org.apache.lucene.document.StoredField;
import org.apache.lucene.document.TextField;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CodeSnippet {
    private String title;
    private String codeContent;
    private Date time;
    private int id;
    public static final String titleKey = "title";
    public static final String codeKey = "code";
    public static final String timeKey = "time";


    public Document get() {
        Document document = new Document();
        FieldType type = new FieldType();
        type.setStored(true);
        document.add(new StoredField(codeKey, codeContent, type));
        document.add(new TextField(titleKey, title, Field.Store.YES));
        document.add(new LongPoint(timeKey, time.getTime()));
        return document;
    }

    public static CodeSnippet from(Document document, int id) {
        return new CodeSnippet(document.get(titleKey), document.get(codeKey), null, id);
    }
}
