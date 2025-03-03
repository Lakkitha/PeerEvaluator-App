if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "C:/Users/Admin/.gradle/caches/8.10.2/transforms/1eb521ca7b1fb70d587697dbe75b2247/transformed/jetified-hermes-android-0.77.1-debug/prefab/modules/libhermes/libs/android.arm64-v8a/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Admin/.gradle/caches/8.10.2/transforms/1eb521ca7b1fb70d587697dbe75b2247/transformed/jetified-hermes-android-0.77.1-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

