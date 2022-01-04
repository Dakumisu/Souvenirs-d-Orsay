precision highp float;

#define PI 3.1415926535897932384626433832795

uniform float uTime;
uniform float uAlpha;
uniform vec3 uColor;
uniform float uRadius;
uniform vec2 uSize;
// uniform vec4 uResolution;
uniform vec3 uResolution;

varying vec2 vUv;
varying vec3 vPos;

float roundRect(vec2 p, vec2 b, float r) {
  return step(.001, length(max(abs(p) - b + r, 0.)) - r);
}

void main() {
	// in the case of an orthographic camera, so that the image keeps its aspect (uResolution must be a vec4)
	// vec2 newUv = (vUv - vec2(.5)) * uResolution.zw + vec2(.5);
	vec2 uv = gl_FragCoord.xy/uResolution.xy;
	uv /= uResolution.z;

	vec3 color = vec3(uColor);
	float alpha = uAlpha;

	// set round corners
	vec2 halfSize = uSize * .5;
	vec2 coord = vUv * uSize;
	vec2 pos = coord - halfSize;
	float roundCorner = roundRect(pos, halfSize, uRadius);
	alpha -= roundCorner;

	gl_FragColor = vec4(color, alpha);
}
