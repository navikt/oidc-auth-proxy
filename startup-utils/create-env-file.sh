#!/usr/bin/env bash

ENV_PATH=$1
AZURE_HOST=$2

echo PORT='8101' > $ENV_PATH
echo CLIENT_ID='oidc-auth-proxy' >> $ENV_PATH
echo JWK='{"kid": "test-cert", "kty":"RSA","n":"2g5WzL5yJESM55Sdy-r_uA5aJkwF_PPa3XSyREJMuv91BkGk1V7pdfi6sN8XFVy6rlPXuHp__XxRortqBOxBVpJfRFv9aNlQcmDZ27-39t-9FehvHfIvpwwCg-ojSxRkbPz9Dw0EnA_-WUXApG14BHMNVNEg-LRFnIO3z8CebgodM4_y9cplqhuYvrPO1wTv-6-BD_hNsMfNr99T5Seq75Meku6Qjzts8bgr5-Z_c_DOdqJ1clcA4qYjXDkdNFQcAc1MqhYt3IiKuvHscLsYTx_uOeSWGSXcPYNJygR7LGcDL-oVV71m8_O7Xd_zBY4VQNUpl1AE70rstKHP2I7CIw","e":"AQAB","d":"pBhcW9IKBZ8Mxo3Bvh6H-FPcpataakR89WEHcnTOV3886stlpyi42g2nOMl6Dpps5hm0YmDVhsYSjTsqiq_cb7DRPplXd5rqfljCOivp3j_7hMwZKtkB4V0ZW3pMuwiKlrZAHh521Jb4mufyFAtJYVfPtX93p5HKPQGmxxI2Z6mTI4Te4nUY7lGNUovVHb3TDgTlLhg2jn1IsN8-GFpuGqJVpKS5lR6aKNZ8V0O0VIOBVmkjS9650MxanFXTH1MmeiWmmIQjailxmBbdY3EC44puxxuixbFrslShDDWz4FzPc52bUxR7n05PssPwmKwdY9k6CDKe-guOJc_r_wf3YQ","p":"8bbeDEAGYEW2sle0H_iDD7pBexDuGMRnqAeAjAh-dbUViaqJfgeh3xVRYs8r-Sv5HCUCkb0DAKDtZnEFi6kUOG32UaNA9Yo0UpZncBWJqdu3TT-wJwZW60UfhCS7cWaYCmrb9KiVQEarp_OCuY6b9Go2NPJIsK84cSunC2naczM","q":"5vGFm12HdYzzpWNql6ntBf96HzUf-R9z7t_P-seULZO6C_I4CWZqLAjnN9DCZU8Fx5nkZdggXuqwNnSSK_tjUlsW1n5i69R14y8PZB6IU8M4HWqUzhO8ix6ku05-MhanvHpDGq91entWRbqAAWWQTINZOsjKBVfRHsvR3u0OdVE","dp":"zmN9j-ovR47fI8K9W7sfdZNtC_71vpIdjBzzxx4NlMYNYOILymAL-GbEemE5Q-YnK7_yRKymXqgKbTk-KfUx_cju1OBXvBDJAmfIZK0PQckI593ktD22g-cetP-ESZz3X5XEwFAeOKbfNWY4jeZWBcmXBXiHVs4WnJNQa-9zhn8","dq":"2OeE9hxNKrHc8LxEE_gsPxLpL0BlLEVHTNb27vHeEUSLW8b-rI19MKiYCctPmXkz03mNk73_AUbpg-vOkfKFIYeeFo0T-a1Nn7fGe-FVZ16WaMJ-ymKtFfkM_UNGsWKn3hTyy7B55TTMHaeBrE4ozkQbXWPSolwNdCA4mGkLyFE","qi":"4lv0L8PPyRRhLNDK5t2nnqAwVMltYQ8YuFEjMckYCjN71p5D9M7TB2ZVQyhoOaLsBinBFDWOW_wFSMQH_7Qjfskg57g8rweKZDfnWhIkc_0P3-I5tr45SOxP-fW7rsRf_qk319tc8xpROdlyoSYQQvCB50DRBRSDYVbUwhZ61BM"}' >> $ENV_PATH
echo DISCOVERY_URL="'http://$AZURE_HOST:8100/v2.0/.well-known/openid-configuration?name=Gizmo%20The%20Cat&user_id=1337'" >> $ENV_PATH
echo LOGIN_SCOPES="'openid profile oidc-auth-proxy/.default'" >> $ENV_PATH
echo OIDC_AUTH_PROXY_BASE_URL="'http://localhost:8101'" >> $ENV_PATH
echo APPLICATION_BASE_URL="'http://localhost:8101/api/azure-mock/audience-check'" >> $ENV_PATH
echo PROXY_CONFIG="'{\"apis\":[{\"path\":\"azure-mock\",\"url\":\"http://$AZURE_HOST:8100\",\"scopes\":\"azure-mock/.default\"}]}'" >> $ENV_PATH
echo SESSION_ID_COOKIE_NAME='oidc-auth-proxy' >> $ENV_PATH
echo SESSION_ID_COOKIE_SIGN_SECRET='foo' >> $ENV_PATH
echo SESSION_ID_COOKIE_VERIFY_SECRET='bar' >> $ENV_PATH
echo ALLOW_PROXY_TO_SELF_SIGNED_CERTIFICATES='true' >> $ENV_PATH
echo CORS_ALLOWED_HEADERS='Content-Type,Referer' >> $ENV_PATH
echo CORS_EXPOSED_HEADERS='Location' >> $ENV_PATH
echo USE_IN_MEMORY_SESSION_STORE='true' >> $ENV_PATH

echo ".env fil opprettet @ $ENV_PATH med azure host $AZURE_HOST"