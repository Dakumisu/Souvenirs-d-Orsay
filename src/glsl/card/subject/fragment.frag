precision highp float;

#define PI 3.1415926535897932384626433832795

uniform bool uActive;
uniform float uTime;
uniform float uAlpha;
uniform float uRadius;
uniform vec2 uSize;
uniform float uProgress;
uniform vec3 uColor;
// uniform vec4 uResolution;
uniform vec3 uResolution;
uniform sampler2D uArtworkTexture;

varying vec2 vUv;
varying vec3 vPos;

float roundRect(vec2 p, vec2 b, float r) {
	return length(max(abs(p) - b + r, 0.)) - r;
}

void main() {
	// in the case of an orthographic camera, so that the image keeps its aspect (uResolution must be a vec4)
	// vec2 newUv = (vUv - vec2(.5)) * uResolution.zw + vec2(.5);
	vec2 uv = gl_FragCoord.xy / uResolution.xy;
	uv /= uResolution.z;

	vec3 color = vec3(uColor);
	float alpha = uAlpha;

	vec2 currentUv = vUv;

	// if (uActive) {
	// 	currentUv = mix(vUv, uv, uProgress);
	// }


	// set round corners
	vec2 halfSize = uSize * .5;
	vec2 coord = vUv * uSize;
	vec2 pos = coord - halfSize;
	float roundCorner = roundRect(pos, halfSize, uRadius);
	// alpha -= roundCorner;

	vec4 artworkTexture = texture2D(uArtworkTexture, currentUv);
	alpha = artworkTexture.a;

	gl_FragColor = vec4(artworkTexture.xyz, alpha);
	// gl_FragColor = vec4(vec3(alpha), 1.);
}
