package com.storyteller_f.co_re;

import java.util.Date;

import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.FieldType;
import org.apache.lucene.document.LongPoint;
import org.apache.lucene.document.StoredField;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.IndexOptions;
import org.apache.lucene.index.IndexableFieldType;

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
	
	public Document get() {
		Document document=new Document();
		FieldType type = new FieldType();
		type.setStored(true);
		document.add(new StoredField("code", codeContent,type));
		document.add(new TextField("title",title,Field.Store.YES));
		document.add(new LongPoint("time",time.getTime()));
		return document;
	}

	public static CodeSnippet to(Document document,int id) {
		return new CodeSnippet(document.get("title"), document.get("code"), null,id);
	}
}
