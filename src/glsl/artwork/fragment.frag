#pragma glslify: curlNoise = require(../../utils/glsl/curlNoise.glsl)
#pragma glslify: cnoise = require(glsl-noise/classic/3d)

precision highp float;

#define PI 3.1415926535897932384626433832795

uniform int uMatCap;
uniform int uType;
uniform float uTime;
uniform float uAlpha;
uniform vec3 uColor;
// uniform vec4 uResolution;
uniform vec3 uResolution;
uniform sampler2D uTexture;
uniform sampler2D uMatCaptexture;
uniform sampler2D uMatCaptexture2;

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

void main() {
	// in the case of an orthographic camera, so that the image keeps its aspect (uResolution must be a vec4)
	// vec2 newUv = (vUv - vec2(.5)) * uResolution.zw + vec2(.5);
	vec3 color = vec3(uColor);
	float alpha = uAlpha;

	if (uType == 0) {
		vec2 mUv = vec2(viewMatrix * vec4(normalize(vNormal), 0)) * 0.5 + vec2(0.5, 0.5);
		vec4 matCaptexture = texture2D(uMatCaptexture, vec2(mUv.x, 1.0 - mUv.y));
		vec4 matCaptexture2 = texture2D(uMatCaptexture2, vec2(mUv.x, 1.0 - mUv.y));

		// vec3 noise = curlNoise(vec3(vNormal * (uTime * .001)));
		float noise = cnoise(vec3((vNormal * 5.) * (uTime * .001)));

		color = mix(matCaptexture.xyz, matCaptexture2.xyz, vNormal);
	} else {
		vec4 texture = texture2D(uTexture, vUv);
		alpha -= smoothstep(0.15, .5, 1. - texture.a);

		color = texture.xyz;
	}

	gl_FragColor = vec4(color, alpha);
}
