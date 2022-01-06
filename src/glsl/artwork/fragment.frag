precision highp float;

#define PI 3.1415926535897932384626433832795

uniform int uType;
uniform float uTime;
uniform float uAlpha;
uniform vec3 uColor;
// uniform vec4 uResolution;
uniform vec3 uResolution;
uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vPos;

void main() {
	// in the case of an orthographic camera, so that the image keeps its aspect (uResolution must be a vec4)
	// vec2 newUv = (vUv - vec2(.5)) * uResolution.zw + vec2(.5);
	vec3 color = vec3(uColor);
	float alpha = uAlpha;

	if (uType == 0) {

	} else {
		vec4 texture = texture2D(uTexture, vUv);
		alpha -= smoothstep(0.15, .5, 1. - texture.a);

		color = texture.xyz;
	}

	gl_FragColor = vec4(color, alpha);
}
