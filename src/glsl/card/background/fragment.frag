#pragma glslify: curlNoise = require(../../../utils/glsl/curlNoise.glsl)
#pragma glslify: cnoise = require(glsl-noise/classic/3d)

precision highp float;

#define PI 3.1415926535897932384626433832795

uniform float uTime;
uniform float uAlpha;
uniform float uRadius;
uniform vec2 uSize;
uniform vec3 uColor;
uniform vec3 uColor1;
// uniform vec4 uResolution;
uniform vec3 uResolution;
uniform sampler2D uWoodTexture;
uniform sampler2D uWood2Texture;
uniform sampler2D uTreeTexture;
uniform sampler2D uLeavesTexture;
uniform sampler2D uDisplacementTexture;
uniform sampler2D uDisplacement2Texture;
uniform sampler2D uDisplacement3Texture;

uniform sampler2D uContoursTexture;

varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

float roundRect(vec2 p, vec2 b, float r) {
	return step(.001, length(max(abs(p) - b + r, 0.)) - r);
}

float random(vec2 st) {
	return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float linearstep(float begin, float end, float t) {
	return clamp((t - begin) / (end - begin), 0.0, 1.0);
}

void main() {
	// in the case of an orthographic camera, so that the image keeps its aspect (uResolution must be a vec4)
	// vec2 newUv = (vUv - vec2(.5)) * uResolution.zw + vec2(.5);
	vec3 color = vec3(uColor);
	float alpha = uAlpha;

	// set round corners
	vec2 halfSize = uSize * .5;
	vec2 coord = vUv * uSize;
	vec2 pos = coord - halfSize;
	float roundCorner = roundRect(pos, halfSize, uRadius);
	alpha -= roundCorner;

	// contours
	float contours = 0.;
	coord = vec2(step(vUv.x - .04, vUv.x - .02	), step(vUv.y - .04, vUv.y - .02)) * (uSize * 1.06);
	// coord = vec2(vUv.x - .02, vUv.y - .04) * (uSize * 1.06);

	pos = coord - halfSize;
	roundCorner = roundRect(pos, halfSize, uRadius);
	contours = roundCorner;


	// cover
	vec2 uv = vUv * .6;
	vec2 curlUv = curlNoise(vec3(uv, uTime * .0001)).xy * .5;

	vec3 displacementTexture = texture2D(uDisplacementTexture, uv).xyz;
	vec3 displacement2Texture = texture2D(uDisplacement2Texture, uv).xyz;
	vec3 displacement3Texture = texture2D(uDisplacement3Texture, uv + ((uv + .5) * curlUv)).xyz;
	vec3 leavesTexture = texture2D(uLeavesTexture, uv + ((uv - .5) * curlUv)).xyz;

	vec2 weirdNoiseUv = mix(leavesTexture.xy, displacement3Texture.xy, curlUv);

	vec3 woodTexture = texture2D(uWoodTexture, mix(displacement2Texture.xy, displacement3Texture.xy, curlUv)).xyz;
	vec3 wood2Texture = texture2D(uWood2Texture, mix(leavesTexture.xy, displacement3Texture.xy, curlUv)).xyz;
	vec3 treeTexture = texture2D(uTreeTexture, weirdNoiseUv).xyz;

	vec3 finalTexture = mix(wood2Texture, treeTexture, cnoise(vec3(uv, uTime * .0001)));

	if (gl_FrontFacing) {
		gl_FragColor = vec4(color * vec3(vUv, 0.), alpha);
		gl_FragColor = vec4(finalTexture, alpha);
	} else {
		gl_FragColor = vec4(color * vPos, alpha);
	}

	gl_FragColor = vec4(vec3(contours), alpha);
}
