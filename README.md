
# URL shortening Project

- **URL shortening 이란?**

  URL 단축(URL shortening)은 월드 와이드 웹 상의 긴 URL을 짧게 만들어 주는 기술이다. URL 단축 기능을 제공하는 서버는 HTTP 넘겨주기를 이용해 클라이언트(client)를 긴 URL로 넘겨준다.

<br/>

## DB table

저는 DB table 구성을 다음과 같이 했습니다.

| 이름(속성)            | 내용                      |
| :-------------------- | ------------------------- |
| index(Auto Increment) | 인덱스                    |
| url                   | 접속하고자하는 Url의 주소 |



<br/>

## Short URL 생성 원리

Short URL은 해당 URL을 직접적으로 encoding하는 방식이 아니라, URL을 삽입하고 해당 Index를 encoding하는 방식이다.

encoding방식은 base 62를 사용했다.

<br/>

#### *여기서 잠깐! base64가 아닌 base62 방식을 사용하는 이유는?*

사실 base 64가 base62보다 많은 정보를 저장할 수 있습니다.

하지만, base64같은 경우에 발생할 수 있는 문제점이 있습니다.

예를 들어, 62와 63에 대해서는 +와/ 값을 가지게 되는데 url에 이 값들이 들어가게 되면 query string이 제대로 작동하지 않을 수 있습니다.

따라서 +와 /을 포함하고 있지 않은 base 62를 사용했습니다.



<br/>

## 서버에서 Short URL을 처리하는 방식

서버에서 요청을 받았을 때에 함수에 Short URL 값을 인자로 넣고

Short URL의 경우 base 62로 encoding 된 값이기 때문에 다시 decoding을 해줍니다.

decoding된 값이 Index값이 되니 해당 Index값의 url을 반환해주면 됩니다.

그렇게 되면, 최종적으로 Short URL값이 들어왔을 때에 다시 원래의 URL값으로 반환해줄 수 있게 됩니다.

<br/>

아래는 base 62방식으로 encoding, decoding 하는 Java코드입니다.

이 코드를 참고하여 구현했습니다.

```java
public class Base62 {
	final int RADIX = 62;
	final String CODEC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	
	public String encoding(long param) {
		StringBuffer sb = new StringBuffer();
		while(param > 0) {
			sb.append(CODEC.charAt((int) (param % RADIX)));
			param /= RADIX;
		}
		return sb.toString();
	}
	
	public long decoding(String param) {
		long sum = 0;
		long power = 1;
		for (int i = 0; i < param.length(); i++) {
			sum += CODEC.indexOf(param.charAt(i)) * power;
			power *= RADIX;
		}
		return sum;
	}
}
```ㅍ
