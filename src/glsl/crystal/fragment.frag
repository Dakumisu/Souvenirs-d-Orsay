precision highp float;
precision highp sampler3D;

#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)
#pragma glslify: curlNoise = require(../../utils/glsl/noises/curlNoise.glsl)

#define PI 3.1415926535897932384626433832795
// debug
uniform vec3 debugVector;
uniform vec2 debugSmoothstep;
uniform vec3 debugFresnelColor;
uniform float debugPow;
uniform float debugMatcapMix;

uniform float uTime;
uniform float uAlpha;
uniform vec3 uColor1;
uniform vec3 uColor2;
// uniform vec4 uResolution;
uniform vec3 uResolution;

uniform vec3 uLightPosition;
uniform float uShininess;
uniform float uLightIntensity;
uniform vec3 uSpecularColor;

uniform sampler2D uDisplacementMap;
uniform sampler2D uMatcapTexture1;
uniform sampler2D uMatcapTexture2;
uniform sampler2D uMatcapTexture3;
uniform sampler2D uMatcapTexture4;

varying vec3 vNormal;
varying vec3 vNormalW;
varying vec3 vPositionW;
varying vec3 vDotNormal;
varying vec2 vUv;
varying vec3 vPos;

float applySoftLightToChannel(float base, float blend) {
	return ((blend < 0.5) ? (2.0 * base * blend + base * base * (1.0 - 2.0 * blend)) : (sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend)));
}
vec4 softLight(vec4 base, vec4 blend) {
	vec4 color = vec4(applySoftLightToChannel(base.r, blend.r), applySoftLightToChannel(base.g, blend.g), applySoftLightToChannel(base.b, blend.b), applySoftLightToChannel(base.a, blend.a));
	return color;
}

vec3 phong(vec3 color) {
	vec3 n = normalize(vNormal);
	vec3 s = normalize(vec3(debugVector) - vPos);
	vec3 v = normalize(vec3(-vPos));
	vec3 r = reflect(-s, n);

	vec3 ambient = color; //u_ka
	vec3 diffuse = color * max(dot(s, n), 0.0); //u_kd
	vec3 specular = uSpecularColor * pow(max(dot(r, v), 0.0), uShininess);

	return uLightIntensity * (ambient + diffuse + specular);
}

float rand(vec2 co) {
	return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float sdBerry(vec3 p, float s) {
	p.x += min(p.y, 0.0) * 0.5;
	return length(p) - s;
}

float map(vec3 rp) {
	// rp *= rotation;

	float d = sdBerry(rp, 0.055) - dot(abs(sin(rp * 140.0)), vec3(0.0035));
	d = min(d, sdBerry(rp, 0.055) - dot(abs(sin(rp * 160.0)), vec3(0.0025)));
	d -= dot(abs(sin(rp * 1000.0)), vec3(0.0001));
	return d;
}

vec3 grad(in vec3 rp) {
	vec2 off = vec2(0.0001, 0.0);
	vec3 g = vec3(map(rp + off.xyy) - map(rp - off.xyy), map(rp + off.yxy) - map(rp - off.yxy), map(rp + off.yyx) - map(rp - off.yyx));
	return normalize(g);
}

const float surfaceThickness = 0.15;
const float density = 20.;
const float ss_pow = 3.;
const float ss_scatter = .1;
const float ss_offset = .5;

float ssThickness(vec3 raypos, vec3 lightdir, vec3 g, vec3 rd) {
	vec3 startFrom = raypos + (-g * surfaceThickness);
	vec3 ro = raypos;

	float len = 0.0;
	const float samples = 12.;
	const float sqs = sqrt(samples);

	for(float s = -samples / 2.; s < samples / 2.; s += 1.0) {
		vec3 rp = startFrom;
		vec3 ld = lightdir;

		ld.x += mod(abs(s), sqs) * ss_scatter * sign(s);
		ld.y += (s / sqs) * ss_scatter;

		ld.x += rand(rp.xy * s) * ss_scatter;
		ld.y += rand(rp.yx * s) * ss_scatter;
		ld.z += rand(rp.zx * s) * ss_scatter;

		ld = normalize(ld);
		vec3 dir = ld;

		for(int i = 0; i < 50; ++i) {
			float dist = map(rp);
			if(dist < 0.0)
				dist = min(dist, -0.0001);
			if(dist >= 0.0)
				break;

			dir = normalize(ld);
			rp += abs(dist * 0.5) * dir;
		}
		len += length(ro - rp);
	}

	return len / samples;
}

float trace(vec3 rp, vec3 rd, vec3 closestPoint) {
	float closest = 99.0;
	bool hit = false;
	for(int i = 0; i < 250; ++i) {
		float dist = map(rp);
		if(dist < closest) {
			closest = dist;
			closestPoint = rp;
		}

		if(dist < 0.0) {
			hit = true;
			break;
		}
		rp += rd * max(dist * 0.5, 0.00001);

		if(rp.z > 1.0) {
			rp += (1.0 - rp.z) * rd;
			break;
		}

	}
	return closest;
}

void main() {
	// in the case of an orthographic camera, so that the image keeps its aspect (uResolution must be a vec4)
	// vec2 newUv = (vUv - vec2(.5)) * uResolution.zw + vec2(.5);

	float test = dot(cameraPosition, vNormalW);
	test = test * test * test;

	test = smoothstep(debugSmoothstep.x, debugSmoothstep.y, test);

	vec3 displacementTexture = texture2D(uDisplacementMap, vUv).xyz;
	vec3 dotP = vec3(smoothstep(.0, .75, vDotNormal * .5) * displacementTexture);
	float noise = snoise4(vec4(vPos, uTime * .0002));

	vec3 color = mix(uColor2, uColor1, noise);

	// color *= displacementTexture;

	vec3 normViewVector = normalize(vDotNormal);
	float reflactorFactor = dot(normViewVector, vec3(debugVector.x, debugVector.y, 1.));
	reflactorFactor = pow(reflactorFactor, debugPow);
	// color = mix(vec3(0.), uColor1, reflactorFactor);
	// color *= noise;

	float fresnel = 1. - smoothstep(debugSmoothstep.x, debugSmoothstep.y, reflactorFactor);
	// color = mix( color, uColor2, 1. - noise * .2);
	color *= mix( uColor1, uColor2, displacementTexture);
	// color *= displacementTexture;

	// color = mix( color, uColor1, fresnel);
	// color += fresnel;

	// color *= fresnel;
	// vec3(pow(.5 - vDotNormal, .5))
	gl_FragColor = vec4(color, uAlpha);
	// gl_FragColor = vec4(vec3(1.), distance(cameraPosition, vPos));
	// gl_FragColor = vec4(color + vec3(1. - test), 1.);

	vec3 rd = normalize(vec3(vUv, 1.0));
    vec3 rp = vec3(-.7, -.7, -2.37);
	vec3 ld = normalize( vec3(.0, .0, 1.0) - rp);
	vec3 g = grad(rp);


    // closest point is used for antialising outline of object
    vec3 closestPoint = vec3(0.0);
    float hit = trace(rp, rd, closestPoint);
    rp = closestPoint;

    float t = ssThickness(rp, ld, g, rd);
    t = exp(ss_offset -t * density);
    t = pow(t, ss_pow);


	vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
	float fresnelTerm = dot(viewDirectionW, vNormalW);
	fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);
	fresnelTerm = pow(fresnelTerm, debugPow);


	color = mix(color, debugFresnelColor, fresnelTerm);


	vec2 mUv = vec2(viewMatrix * vec4(normalize(vNormal), 0)) * 0.5 + vec2(0.5, 0.5);
	vec4 matCap_1 = texture2D(uMatcapTexture1, vec2(mUv.x, 1.0 - mUv.y));
	vec4 matCap_2 = texture2D(uMatcapTexture2, vec2(mUv.x, 1.0 - mUv.y));
	vec4 matCap_3 = texture2D(uMatcapTexture3, vec2(mUv.x, 1.0 - mUv.y));
	vec4 matCap_4 = texture2D(uMatcapTexture4, vec2(mUv.x, 1.0 - mUv.y));

	vec4 matCap = mix(matCap_1, matCap_3, debugMatcapMix);

	// color *= fresnelTerm;
	color += matCap.xyz;

	color = phong(color);

	color *= vec3(mix(color, matCap_4.xyz, hit / surfaceThickness));


	gl_FragColor = vec4(color, 1.);
	// gl_FragColor = vec4(phong(color), 1.);
	// gl_FragColor = vec4(vec3(t), 1.);
	// gl_FragColor = vec4(vec3(mix(matCap_4, matCap_3, hit / surfaceThickness * .5)), 1.);
	// gl_FragColor = matCap_4;

}
